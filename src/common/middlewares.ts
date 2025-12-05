import jwt, { type JwtPayload } from 'jsonwebtoken';
import prisma from '../../prisma/prisma.js';
import type { Request, Response, NextFunction } from 'express';
import type { UserRole } from '@prisma/client';

// Access Token 검증
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    // 요청 헤더에서 토큰 꺼내기
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: ' 토큰이 없습니다.' });
      return;
    }

    // "Bearer 토큰값" 형태 에서 "토큰값"만 분리
    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ success: false, message: '토큰이 없습니다. ' });
      return;
    }

    // JWT_SECRET 환경 변수 확인
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET이 설정되지 않았습니다.');
      res.status(500).json({ success: false, message: '서버 설정 오류' });
      return;
    }

    // 토큰 검증 ( 비밀키는 .env에 저장)
    const decoded = jwt.verify(token, jwtSecret) as unknown as JwtPayload & {
      userId: string;
      email: string;
      type: UserRole;
    };

    // 토큰 안에 있는 유저 정보
    req.user = {
      id: Number(decoded.userId),
      email: decoded.email,
      type: decoded.type,
    };

    next();
  } catch (err: unknown) {
    console.error('JWT 검증 실패:', err instanceof Error ? err.message : err);
    res
      .status(401)
      .json({ success: false, message: '유효하지 않는 토큰입니다.' });
  }
}

// Refresh Token 검증
export async function refreshMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        message: 'Refresh Token이 없습니다.',
      });
      return;
    }

    const jwtRefreshSecret = process.env.REFRESH_SECRET;

    if (!jwtRefreshSecret) {
      console.error('FEFRESH_SECRET이 설정되지 않았습니다.');
      res.status(500).json({
        message: '서버 설정 오류',
      });
      return;
    }

    const decoded = jwt.verify(refreshToken, jwtRefreshSecret) as JwtPayload & {
      userId: string;
      email: string;
      type: UserRole;
    };

    const user = await prisma.user.findUnique({
      where: { id: Number(decoded.userId) },
    });

    if (!user) {
      res.status(401).json({
        message: '유효하지 않은 토큰입니다.',
      });
      return;
    }

    if (!user.refreshToken && user.refreshToken !== refreshToken) {
      res.status(401).json({
        message: '유효하지 않은 Refresh Token입니다.',
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      type: user.type,
    };

    next();
  } catch (err: unknown) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        message: 'Refresh Token이 만료되었습니다.',
      });
      return;
    }

    console.error(
      'Refresh Token 검증 실패:',
      err instanceof Error ? err.message : err,
    );
    res.status(401).json({
      message: '유효하지 않은 Refresh Token입니다.',
    });
  }
}

// 권한 체크
export function requireSeller(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: '인증이 필요합니다.',
    });
    return;
  }

  if (req.user.type !== 'SELLER') {
    res
      .status(403)
      .json({ success: false, message: '판매자 권한이 필요합니다.' });
    return;
  }

  next();
}

export function requireBuyer(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.user) {
    res.status(401).json({ success: false, messsage: '인증이 필요합니다.' });
    return;
  }

  if (req.user.type !== 'BUYER') {
    res
      .status(403)
      .json({ success: false, message: '구매자 권한이 필요합니다.' });
    return;
  }

  next();
}
