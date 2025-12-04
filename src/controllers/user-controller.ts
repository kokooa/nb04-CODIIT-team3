import { signupService, updateUserService } from '../services/user-service.js';
import type { Request, Response, NextFunction } from 'express';
import { HttpError } from '../../utils/error-handler.js';

// 회원가입
export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const { type, name, email, password } = req.body;

    const user = await signupService(type, name, email, password);

    res.status(201).json({
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

// 개인정보 수정
export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user || !req.user.id) {
      throw new HttpError('인증 정보가 누락되었습니다.', 401);
    }
    const userId = req.user.id;

    const { currentPassword, newName, newImage, newPassword } = req.body;

    const profile = await updateUserService(
      userId,
      currentPassword,
      newName,
      newImage,
      newPassword,
    );

    res.status(200).json({
      message: '정보 수정 성공',
      data: profile,
    });
  } catch (err) {
    next(err);
  }
}
