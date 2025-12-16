import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard-service';

class DashboardController {
  async getAggregatedData(req: Request, res: Response, next: NextFunction) {
    try {
      const sellerId = req.user!.id;
      const data = await dashboardService.getAggregatedDashboardData(sellerId);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();