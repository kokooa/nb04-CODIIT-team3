import prisma from '../../prisma/prisma.js';
import bcrypt from 'bcrypt';
import type { User, UserRole } from '@prisma/client';
import { HttpError } from '../../utils/error-handler.js';

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
          grade: 'BRONZE',
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

// 개인정보 수정
export async function updateUserService(
  userId: number,
  currentPassword: string,
  newName?: string,
  newImage?: string,
  newPassword?: string,
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

  // 1. 업데이트할 데이터 객체 준비
  const updateData: Partial<User> = {};

  if (newName) {
    updateData.name = newName;
  }
  if (newImage) {
    updateData.image = newImage;
  }

  if (newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
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
  return update;
}
