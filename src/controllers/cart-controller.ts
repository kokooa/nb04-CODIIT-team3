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
      const items = await CartService.getCart(userId);
      items.map(item => ({
        ...item,
        product: { ...item.product, image: buildFileUrl(item.product.image) },
      }));

      res.status(200).json({ items: items });
    } catch (error) {
      res
        .status(500)
        .json({ message: '조회 실패', error: (error as Error).message });
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
