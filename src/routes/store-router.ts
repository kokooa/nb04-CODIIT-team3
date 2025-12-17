// src/routes/store-router.ts
import { Router, type Request } from 'express';
import { StoreController } from '../controllers/store-controller.js';
import { authenticate, authorize, checkExistingStore, isStoreOwner } from '../common/middlewares.js';
import { UserRole } from '@prisma/client';
import multer from 'multer';
import path from 'path';

const storeRouter = Router();
const storeController = new StoreController();

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, 'uploads/');
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 1. 스토어 등록 (판매자만 가능, 판매자당 1개)
storeRouter.post(
  '/',
  authenticate,
  authorize([UserRole.SELLER]),
  upload.single('storeImageUrl'),
  checkExistingStore,
  storeController.createStore
);

// 2. 판매자 본인 스토어 조회 (판매자만 가능)
storeRouter.get(
  '/detail/my', // Frontend's expected endpoint
  authenticate,
  authorize([UserRole.SELLER]),
  storeController.getMyStore
);

// 3. 스토어 수정 (스토어 소유주 판매자만 가능)
storeRouter.patch(
  '/:storeId',
  authenticate,
  authorize([UserRole.SELLER]),
  isStoreOwner,
  upload.single('storeImageUrl'),
  storeController.updateStore
);

// 2.5. 스토어 상세 조회 (모든 사용자 가능)
storeRouter.get(
  '/:storeId',
  storeController.getStoreDetail // 아직 구현되지 않음
);

// 4. 특정 스토어를 관심 스토어로 등록 (인증된 사용자라면 누구든 가능)
storeRouter.post(
  '/:storeId/favorite',
  authenticate,
  storeController.addFavoriteStore
);

// 5. 특정 스토어를 관심 스토어에서 해제 (인증된 사용자라면 누구든 가능)
storeRouter.delete(
  '/:storeId/favorite',
  authenticate,
  storeController.removeFavoriteStore
);

// 6. 사용자의 관심 스토어 목록 조회 (인증된 사용자 본인만 가능)
storeRouter.get(
  '/favorites',
  authenticate,
  storeController.getFavoriteStores
);

export { storeRouter };
