// src/routes/store-router.ts
import { Router } from 'express';
import { StoreController } from '../controllers/store-controller';
import { authenticate, authorize, checkExistingStore, isStoreOwner } from '../common/middlewares';
import { UserRole } from '@prisma/client';

const storeRouter = Router();
const storeController = new StoreController();

// 1. 스토어 등록 (판매자만 가능, 판매자당 1개)
storeRouter.post(
  '/',
  authenticate,
  authorize([UserRole.SELLER]),
  checkExistingStore, // 판매자가 이미 스토어를 가지고 있는지 확인
  storeController.createStore
);

// 2. 판매자 본인 스토어 조회 (판매자만 가능)
storeRouter.get(
  '/my-store',
  authenticate,
  authorize([UserRole.SELLER]),
  storeController.getMyStore
);

// 3. 스토어 수정 (스토어 소유주 판매자만 가능)
storeRouter.put(
  '/:storeId',
  authenticate,
  authorize([UserRole.SELLER]),
  isStoreOwner, // 요청된 스토어의 소유주인지 확인
  storeController.updateStore
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
