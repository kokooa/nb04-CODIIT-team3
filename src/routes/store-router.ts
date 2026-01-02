// src/routes/store-router.ts
import { Router, type Request } from 'express';
import { StoreController } from '../controllers/store-controller.js';
import { authMiddleware, requireSeller } from '../common/middlewares.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storeRouter = Router();
const storeController = new StoreController();

try {
  fs.readdirSync('uploads');
} catch (error) {
  console.log('uploads 폴더가 없어 자동으로 생성합니다.');
  fs.mkdirSync('uploads');
}

const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) => {
    cb(null, 'uploads/');
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname +
        '-' +
        uniqueSuffix +
        uniqueSuffix +
        path.extname(file.originalname),
    );
  },
});

const upload = multer({ storage: storage });

// 1. 스토어 등록 (판매자만 가능, 판매자당 1개)
storeRouter.post(
  '/',
  authMiddleware,
  requireSeller,
  upload.single('image'),
  storeController.createStore,
);

// 2. 판매자 본인 스토어 조회 (판매자만 가능) - 정적 경로 먼저
storeRouter.get(
  '/detail/my',
  authMiddleware,
  requireSeller,
  storeController.getMyStore,
);

// 3. 사용자의 관심 스토어 목록 조회 - 정적 경로 먼저
storeRouter.get(
  '/favorites',
  authMiddleware,
  storeController.getFavoriteStores,
);

// 4. 스토어 상세 조회 (모든 사용자 가능) - 동적 경로
storeRouter.get('/:storeId', storeController.getStoreDetail);

// 5. 스토어 수정 (스토어 소유주 판매자만 가능)
storeRouter.patch(
  '/:storeId',
  authMiddleware,
  requireSeller,
  upload.single('image'),
  storeController.updateStore,
);

// 6. 관심 스토어 등록 (인증된 사용자)
storeRouter.post(
  '/:storeId/favorite',
  authMiddleware,
  storeController.addFavoriteStore,
);

// 7. 관심 스토어 해제 (인증된 사용자)
storeRouter.delete(
  '/:storeId/favorite',
  authMiddleware,
  storeController.removeFavoriteStore,
);

export { storeRouter };
