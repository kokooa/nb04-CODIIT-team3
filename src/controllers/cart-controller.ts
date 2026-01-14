import type { Request, Response } from 'express';
import { CartService } from '../services/cart-service.js';
import { buildFileUrl } from '../common/uploads.js';

export const CartController = {
  async addToCart(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const body = req.body || {};
      const { productId, size, quantity } = body;

      if (!productId || !size || !quantity) {
        return res.status(400).json({ message: '상품 정보가 부족합니다.' });
      }

      const result = await CartService.addToCart(
        userId,
        productId,
        size,
        quantity,
      );
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        message: '장바구니 담기 실패',
        error: (error as Error).message,
      });
    }
  },

  async getMyCart(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      // 서비스에서 이미 { id, items: [...] } 형태로 가공해서 줍니다.
      const result = await CartService.getCart(userId);

      // ❌ 예전 코드: items.map을 또 하거나, { items: result }로 감싸면 안 됩니다!
      // ✅ 수정 코드: 결과 그대로 반환
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: '조회 실패',
        error: (error as Error).message,
      });
    }
  },

  async removeCartItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: 'ID가 필요합니다.' });

      await CartService.removeFromCart(id);
      res.status(200).json({ message: '삭제 완료' });
    } catch (error) {
      res
        .status(500)
        .json({ message: '삭제 실패', error: (error as Error).message });
    }
  },
};
