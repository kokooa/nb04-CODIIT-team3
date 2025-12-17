import prisma from '../../prisma/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { HttpError } from '../../utils/error-handler.js';
import dotenv from 'dotenv';
import type { DBUserResult } from '../../types/index.js';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

if (!JWT_SECRET || !REFRESH_SECRET) {
  throw new Error(
    '❌ JWT_SECRET 또는 REFRESH_SECRET 환경변수가 설정되지 않았습니다.',
  );
}

// 로그인 및 Access/Refresh 토큰 발급
export async function loginService(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new HttpError('요청한 리소스를 찾을 수 없습니다.', 404);
  }

  if (!(await bcrypt.compare(password, user.password))) {
    throw new HttpError('이메일 또는 비밀번호가 올바르지 않습니다.', 401);
  }

  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET!,
    { expiresIn: '2h' },
  );

  const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET!, {
    expiresIn: '7d',
  });

  const safeUserResult = (await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
    select: {
      id: true,
      email: true,
      name: true,
      type: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      userPoints: {
        select: {
          points: true,
          grade: true,
        },
      },
    },
  })) as DBUserResult;

  return {
    user: safeUserResult,
    accessToken,
    refreshToken,
  };
}

// Refresh Token으로 Access Token 재발급
export async function reloadService(refreshToken: string) {
  const user = await prisma.user.findFirst({
    where: { refreshToken },
  });

  if (!user) {
    throw new HttpError('유효하지 않은 리프레쉬 토큰입니다.', 403);
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, REFRESH_SECRET!);
  } catch (err) {
    throw new HttpError('Unauthorized', 401);
  }

  const newAccessToken = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET!,
    { expiresIn: '2h' },
  );

  return newAccessToken;
}

// 로그아웃
export async function logoutService(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });

  return;
}
