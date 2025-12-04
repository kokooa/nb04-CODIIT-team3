import type { Request, Response, NextFunction } from 'express';
import { loginService, reloadService } from '../services/auth-service.js';
import { HttpError } from '../../utils/error-handler.js';
import { mapUserToClientResponse } from '../../utils/user-mapper.js';

// 로그인 및 Access/Refresh 토큰 발급
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new HttpError('잘못된 요청입니다', 400);
    }
    const {
      user: dbUser,
      accessToken,
      refreshToken,
    } = await loginService(email, password);

    const userPayload = mapUserToClientResponse(dbUser);

    res.status(201).json({
      user: userPayload,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

// Refresh Token으로 Access Token 재발급
export async function reload(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new HttpError('잘못된 요청입니다.', 400);
    }

    const newAccessToken = await reloadService(refreshToken);

    res.status(200).json({
      data: newAccessToken,
    });
  } catch (err) {
    next(err);
  }
}

// 로그아웃
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new HttpError('인증이 필요합니다.', 401);
    }

    res.status(200).json({
      message: '성공적으로 로그아웃 되었습니다.',
    });
  } catch (err) {
    next(err);
  }
}
