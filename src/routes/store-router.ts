// src/routes/store-router.ts
import { Router } from 'express';
import { StoreController } from '../controllers/store-controller.js';
import { authMiddleware, requireSeller } from '../common/middlewares.js';
import { upload } from '../common/uploads.js';

const router = Router(); // 변수명을 storeRouter -> router로 통일
const storeController = new StoreController();

// 1. 스토어 등록 (판매자만 가능, 판매자당 1개)
router.post(
  '/',
  authMiddleware,
  requireSeller,
  upload.single('image'),
  storeController.createStore,
);

// 2. 판매자 본인 스토어 조회 (판매자만 가능) - 정적 경로 먼저
router.get(
  '/detail/my',
  authMiddleware,
  requireSeller,
  storeController.getMyStore,
);

router.get(
  '/detail/my/product',
  authMiddleware,
  requireSeller,
  storeController.getMyStoreWithProducts,
);

// 3. 사용자의 관심 스토어 목록 조회 - 정적 경로 먼저
router.get('/favorites', authMiddleware, storeController.getFavoriteStores);

// 4. 스토어 상세 조회 (모든 사용자 가능) - 동적 경로
router.get('/:storeId', storeController.getStoreDetail);

// 5. 스토어 수정 (스토어 소유주 판매자만 가능)
router.patch(
  '/:storeId',
  authMiddleware,
  requireSeller,
  upload.single('image'),
  storeController.updateStore,
);

// 6. 관심 스토어 등록 (인증된 사용자)
router.post(
  '/:storeId/favorite',
  authMiddleware,
  storeController.addFavoriteStore,
);

// 7. 관심 스토어 해제 (인증된 사용자)
router.delete(
  '/:storeId/favorite',
  authMiddleware,
  storeController.removeFavoriteStore,
);

// ✅ 가장 중요한 변경점: export default로 변경
export default router;
