import express from 'express';
type Request = express.Request;
type Response = express.Response;
type NextFunction = express.NextFunction;
import { DashboardService } from '../services/dashboard-service.js';

class DashboardController {
  async getAggregatedData(req: Request, res: Response, next: NextFunction) {
    try {
      const sellerId = req.user!.id;
      const data = await DashboardService.getAggregatedDashboardData(sellerId);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
