import {
  getUserService,
  signupService,
  unregisterService,
  updateUserService,
  getMyFavoriteStoresService,
} from '../services/user-service.js';
import type { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/error-handler.js';
import { getUserPointService } from '../services/user-service.js';
import { buildFileUrl } from '../common/uploads.js';

// 회원가입
export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const { type = 'BUYER', name, email, password } = req.body;

    const vaildTypes = ['BUYER', 'SELLER'];
    if (!vaildTypes.includes(type)) {
      throw new Error('유효하지 않은 가입 유형입니다.');
    }

    const user = await signupService(type, name, email, password);

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

// 내 정보 수정
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

    const { currentPassword, name, password } = req.body;

    if (!name && !password) {
      throw new HttpError('수정할 정보를 입력해주세요', 400);
    }

    if (!currentPassword) {
      throw new HttpError('정보를 수정하려면 현재 비밀번호가 필요합니다.', 400);
    }

    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    const profile = await updateUserService(
      userId,
      currentPassword,
      name,
      image,
      password,
    );

    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
}

// 내 정보 조회
export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new HttpError('유저 정보 없음', 400);
    }

    const data = await getUserService(userId);

    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

// 회원 탈퇴
export async function unregister(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user || !req.user.id) {
      throw new HttpError('잘못된 요청입니다', 400);
    }
    const userId = req.user?.id;

    const data = await unregisterService(userId);

    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

// 내 포인트 조회
export const getMyPointInfo = async (req: Request, res: Response) => {
  try {
    // 1. 로그인 미들웨어(AuthGuard)를 통과했다면 req.user 등에 id가 있을 것입니다.
    if (!req.user || !req.user.id) {
      throw new HttpError('잘못된 요청입니다', 400);
    }
    const userId = req.user.id;

    // 2. 서비스 로직 호출
    const data = await getUserPointService(userId);

    // 3. 성공 응답
    return res.status(200).json({
      status: 'success',
      data: data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
};

// 내 관심 스토어 조회
export async function getMyFavoriteStores(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // 1. 로그인된 유저 ID 가져오기 (authMiddleware 통과 후)
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new HttpError('인증이 필요합니다.', 401);
    }

    // 2. 서비스 호출
    const myFavoriteStores = await getMyFavoriteStoresService(userId);

    // 3. 응답 반환
    res.status(200).json(myFavoriteStores);
  } catch (error) {
    next(error);
  }
}
