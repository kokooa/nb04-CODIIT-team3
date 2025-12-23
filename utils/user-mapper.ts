import type { User, UserPoint } from '@prisma/client';
import type { UserResponseDto } from '../types/index.js';

const GRADE_INFO = {
  Green: { rate: 1, minAmount: 0 },
  Orange: { rate: 3, minAmount: 100000 },
  Red: { rate: 5, minAmount: 300000 },
  Black: { rate: 7, minAmount: 500000 },
  VIP: { rate: 10, minAmount: 1000000 },
} as const;

type Grade = keyof typeof GRADE_INFO;

export const mapUserToClientResponse = (dbUser: any) => {
  // userPoints가 없거나 비어있으면 기본값 사용
  const userPointData =
    dbUser.userPoints && dbUser.userPoints.length > 0
      ? dbUser.userPoints[0]
      : { points: 0, grade: 'Green' }; // 기본값

  const gradeKey = (userPointData.grade || 'Green') as Grade;
  const gradeData = GRADE_INFO[gradeKey] || GRADE_INFO.Green;

  const userGrade = {
    id: `grade_${gradeKey.toLowerCase()}`,
    name: gradeKey,
    rate: gradeData.rate,
    minAmount: gradeData.minAmount,
  };

  const userPayload = {
    id: String(dbUser.id),
    email: dbUser.email,
    name: dbUser.name,
    type: dbUser.type,
    image: dbUser.image,
    createdAt: dbUser.createdAt.toISOString(),
    updatedAt: dbUser.updatedAt.toISOString(),
    points: String(userPointData.points || 0),
    grade: userGrade,
  };

  return userPayload;
};

export const toUserResponseDto = (
  user: User & { userPoints: UserPoint | null },
): UserResponseDto => {
  const gradeKey = (user.userPoints?.grade || 'Green') as Grade;
  const gradeData = GRADE_INFO[gradeKey] || GRADE_INFO.Green;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    password: user.password, // 필요시 제거
    type: user.type,
    points: user.userPoints?.points || 0,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    grade: {
      id: `grade_${gradeKey.toLowerCase()}`,
      name: gradeKey,
      rate: gradeData.rate,
      minAmount: gradeData.minAmount,
    },
    image: user.image || '',
  };
};
