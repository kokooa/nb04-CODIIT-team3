import type { Request, Response } from 'express';
import { PointService } from '../services/point-service.js';

export const PointController = {
  // 내 포인트 대시보드 조회
  async getMyPointInfo(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ message: '로그인 필요' });

      // PointService가 types/index.ts의 UserPointResponse 형식으로 리턴함
      const result = await PointService.getMyPointInfo(userId);

      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: '포인트 조회 실패' });
    }
  },
};
