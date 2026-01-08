import { Router } from 'express';
import { PurchaseService } from '../services/purchase-service.js';
import { authMiddleware } from '../common/middlewares.js';

const router = Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const order = await PurchaseService.createOrder(userId, req.body);
    res.status(201).json(order);
  } catch (error) {
    res
      .status(500)
      .json({ message: '주문 실패', error: (error as Error).message });
  }
});

export default router;
