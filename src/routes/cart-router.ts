import { Router } from 'express';
import { CartController } from '../controllers/cart-controller.js';
// authenticate는 로그인을 확인하는 미들웨어라고 가정합니다.
import { authMiddleware } from '../common/middlewares.js';

const router = Router();

router.post('/', authMiddleware, CartController.addToCart);
router.get('/', authMiddleware, CartController.getMyCart);
router.delete('/:id', authMiddleware, CartController.removeCartItem);

export default router;
