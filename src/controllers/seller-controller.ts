import type { Request, Response } from 'express';
import { SellerService } from '../services/seller-service.js';

export const SellerController = {
  async getDashboard(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ message: '로그인 필요' });

      const data = await SellerService.getDashboard(userId);

      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: '대시보드 조회 실패' });
    }
  },
};
