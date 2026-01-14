import { Router } from 'express';
// [수정] Service 대신 Controller를 import 합니다.
import { PurchaseController } from '../controllers/purchase-controller.js';
import { authMiddleware } from '../common/middlewares.js';

const router = Router();

router.post('/', authMiddleware, PurchaseController.createOrder);
router.get('/', authMiddleware, PurchaseController.getPurchases);
router.get('/:id', authMiddleware, PurchaseController.getPurchaseById);
router.patch('/:id', authMiddleware, PurchaseController.updatePurchase);
router.delete('/:id', authMiddleware, PurchaseController.cancelPurchase);
export default router;
