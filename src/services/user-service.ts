import prisma from '../common/prisma.js';
import bcrypt from 'bcrypt';
import type { User, UserRole } from '@prisma/client';
import { HttpError } from '../utils/error-handler.js';
import { toUserResponseDto } from '../utils/user-mapper.js';
import type { UserResponseDto } from '../types/index.js';
import { GRADE_POLICIES } from '../types/index.js';
import type { GradePolicy, UserPointResponse } from '../types/index.js';
import { buildFileUrl } from '../common/uploads.js';

const GRADE_RATES: { [key: string]: number } = {
  Green: 0.01,
  Orange: 0.02,
  Red: 0.03,
  Black: 0.05,
  VIP: 0.07,
};

// 회원가입
export async function signupService(
  type: UserRole,
  name: string,
  email: string,
  password: string,
) {
  if (!name || !email || !password) {
    throw new HttpError('닉네임과 이메일과 비밀번호는 필수입니다', 400);
  }

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { name }],
    },
  });

  if (existing) {
    throw new HttpError('이미 존재하는 유저입니다.', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      type,
      email,
      name,
      password: hashedPassword,
      userPoints: {
        create: {
          points: 0,
          grade: 'Green',
          accumulatedAmount: 0,
        },
      },
    },
    select: {
      id: true,
      type: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  return user;
}

// 내 정보 수정
export async function updateUserService(
  userId: string,
  currentPassword: string,
  name?: string,
  image?: string,
  password?: string,
) {
  if (!currentPassword || currentPassword.trim() === '') {
    throw new HttpError('현재 비밀번호를 입력해야 합니다.', 400);
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      password: true,
    },
  });

  if (!user) {
    throw new HttpError('유저를 찾을 수 없습니다.', 404);
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    throw new HttpError('현재 비밀번호가 일치 하지 않습니다.', 401);
  }

  const updateData: Partial<User> = {};

  if (name) {
    updateData.name = name;
  }
  if (image) {
    updateData.image = image;
  }

  if (password) {
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      throw new HttpError(
        '새 비밀번호는 현재 비밀번호와 다르게 설정해야 합니다.',
        400,
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    updateData.password = hashedPassword;
  }

  const update = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      image: true,
      name: true,
      email: true,
    },
  });

  if (update) update.image = image ? buildFileUrl(image) : null;

  return update;
}

export async function getUserService(userId: string): Promise<UserResponseDto> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { userPoints: true }, // DB에서 포인트 정보 가져오기
  });

  if (!user) {
    throw new HttpError('유저를 찾을 수 없습니다.', 404);
  }

  // 기존 DTO 매퍼 사용
  const basicDto = toUserResponseDto(user);

  // DB에 있는 최신 포인트/등급 정보 추출
  const currentGrade = user.userPoints?.grade || 'Green';
  const currentPoints = user.userPoints?.points || 0;
  const currentRate = GRADE_RATES[currentGrade] || 0.01;

  return {
    ...basicDto,
    points: currentPoints,
    grade: {
      id: currentGrade,
      name: currentGrade,
      rate: currentRate,
      minAmount: 0,
      text: `${(currentRate * 100).toFixed(0)}% 적립`,
    },
  } as unknown as UserResponseDto;
}

// 회원 탈퇴
export async function unregisterService(userId: string) {
  if (!userId) {
    throw new HttpError('인증이 필요합니다', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new HttpError('유저를 찾을 수 없습니다.', 404);
  }

  await prisma.user.delete({
    where: { id: userId },
  });
}

export const getUserPointService = async (
  userId: string,
): Promise<UserPointResponse> => {
  const userPointData = await prisma.userPoint.findUnique({
    where: { userId: userId },
  });

  // 데이터가 없으면 신규 유저 취급
  const currentPoint = userPointData?.points ?? 0;
  const currentAmount = userPointData?.accumulatedAmount ?? 0;
  const dbGrade = userPointData?.grade ?? 'Green';

  // -----------------------------------------------------------
  // 등급 계산 로직 (기준: 누적 구매 금액 accumulatedAmount)
  // -----------------------------------------------------------
  let currentPolicyIndex = 0;

  for (const [index, policy] of GRADE_POLICIES.entries()) {
    if (currentAmount >= policy.minAmount) {
      currentPolicyIndex = index;
    } else {
      break;
    }
  }

  const currentPolicy = GRADE_POLICIES[currentPolicyIndex];

  if (!currentPolicy) {
    throw new HttpError('매칭되는 등급 정책이 없습니다.', 404);
  }

  const nextPolicy = GRADE_POLICIES[currentPolicyIndex + 1];

  // -----------------------------------------------------------
  // 다음 등급까지 남은 금액 및 달성률 계산
  // -----------------------------------------------------------
  let nextGradeName: string | null = null;
  let remainingAmount = 0;
  let progressPercent = 100;

  if (nextPolicy) {
    nextGradeName = nextPolicy.grade;

    remainingAmount = Math.max(0, nextPolicy.minAmount - currentAmount);

    const currentStageTotal = nextPolicy.minAmount - currentPolicy.minAmount;
    const currentStageProgress = currentAmount - currentPolicy.minAmount;

    if (currentStageTotal > 0) {
      progressPercent = Math.floor(
        (currentStageProgress / currentStageTotal) * 100,
      );
    } else {
      progressPercent = 0;
    }
  }

  // -----------------------------------------------------------
  // 결과 반환
  // -----------------------------------------------------------
  return {
    userSummary: {
      currentPoint: currentPoint,
      currentGrade: dbGrade,
      nextGrade: nextGradeName,
      remainingPoint: remainingAmount,
      progressPercent: progressPercent,
    },
  };
};

// 내 관심 스토어 조회 서비스
export async function getMyFavoriteStoresService(userId: string) {
  if (!userId) {
    throw new HttpError('유저 정보를 찾을 수 없습니다.', 401);
  }

  const favoriteStores = await prisma.favoriteStore.findMany({
    where: {
      userId: userId,
    },
    select: {
      storeId: true,
      userId: true,
      store: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return favoriteStores;
}
