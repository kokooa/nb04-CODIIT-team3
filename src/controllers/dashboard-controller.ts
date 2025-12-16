// src/controllers/dashboard-controller.ts
import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard-service';

class DashboardController {
  async getSalesSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const sellerId = req.user!.id;
      const { startDate, endDate } = req.query;

      // 기본값: 최근 30일
      const end = endDate ? new Date(endDate as string) : new Date();
      const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(end.getDate() - 30));

      const summary = await dashboardService.getSalesSummary(sellerId, start, end);
      res.status(200).json(summary);
    } catch (error) {
      next(error);
    }
  }

  async getTopProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const sellerId = req.user!.id;
      const { startDate, endDate } = req.query;

      const end = endDate ? new Date(endDate as string) : new Date();
      const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(end.getDate() - 30));
      
      const topProducts = await dashboardService.getTopProducts(sellerId, start, end);
      res.status(200).json(topProducts);
    } catch (error) {
      next(error);
    }
  }

  async getSalesByPriceRange(req: Request, res: Response, next: NextFunction) {
    try {
      const sellerId = req.user!.id;
      const { startDate, endDate } = req.query;
      
      const end = endDate ? new Date(endDate as string) : new Date();
      const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(end.getDate() - 30));

      const salesByPrice = await dashboardService.getSalesByPriceRange(sellerId, start, end);
      res.status(200).json(salesByPrice);
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
