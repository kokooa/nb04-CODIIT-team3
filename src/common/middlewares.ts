// src/common/middlewares.ts
import express from 'express';
type Request = express.Request;
type Response = express.Response;
type NextFunction = express.NextFunction;
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

// Request 객체에 user 속성을 추가하기 위한 타입 선언
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: UserRole;
      };
    }
  }
}

// JWT 비밀 키 (환경 변수에서 가져오는 것이 권장됩니다)
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey'; // 실제 프로젝트에서는 강력한 키 사용

/**
 * JWT 토큰을 통해 사용자를 인증하는 미들웨어.
 * 유효한 토큰일 경우 req.user에 사용자 정보(id, role)를 추가합니다.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: UserRole };
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: '인증 토큰이 만료되었습니다.' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: '유효하지 않은 인증 토큰입니다.' });
    }
    // 기타 JWT 관련 오류는 다음 미들웨어로 전달
    next(error);
  }
};

/**
 * 특정 역할(role)을 가진 사용자만 접근을 허용하는 미들웨어 팩토리.
 */
export const authorize = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      // authenticate 미들웨어가 먼저 실행되어야 합니다.
      return res.status(403).json({ message: '사용자가 인증되지 않았습니다.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: '접근이 거부되었습니다. 권한이 부족합니다.' });
    }
    next();
  };
};

/**
 * 인증된 사용자(판매자)가 이미 스토어를 가지고 있는지 확인하는 미들웨어.
 * 스토어 생성 시 판매자당 1개의 스토어만 허용하도록 강제합니다.
 */
export const checkExistingStore = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== UserRole.SELLER) {
    return res.status(403).json({ message: '접근이 거부되었습니다. 판매자만 스토어를 생성할 수 있습니다.' });
  }

  try {
    const existingStore = await prisma.store.findUnique({
      where: { sellerId: req.user.id },
    });

    if (existingStore) {
      return res.status(409).json({ message: '이미 해당 판매자에게 스토어가 존재합니다.' });
    }
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * 인증된 사용자(판매자)가 요청된 스토어의 소유자인지 확인하는 미들웨어.
 * 스토어 수정/삭제 시 사용됩니다.
 * authenticate 및 authorize([UserRole.SELLER]) 미들웨어가 먼저 실행되어야 합니다.
 */
export const isStoreOwner = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== UserRole.SELLER) {
    return res.status(403).json({ message: '접근이 거부되었습니다. 판매자만 자신의 스토어를 수정할 수 있습니다.' });
  }

  const storeId = parseInt(req.params.storeId as string);
  if (isNaN(storeId)) {
    return res.status(400).json({ message: '유효하지 않은 스토어 ID 형식입니다.' });
  }

  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return res.status(404).json({ message: '스토어를 찾을 수 없습니다.' });
    }

    if (store.sellerId !== req.user.id) {
      return res.status(403).json({ message: '접근이 거부되었습니다. 이 스토어의 소유자가 아닙니다.' });
    }
    next();
  } catch (error) {
    next(error);
  }
};
