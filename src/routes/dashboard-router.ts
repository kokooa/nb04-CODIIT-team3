import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard-controller.js';
import { authMiddleware, requireSeller } from '../common/middlewares.js';

const dashboardRouter = Router();

dashboardRouter.get(
  '/',
  authMiddleware,
  requireSeller,
  dashboardController.getAggregatedData
);

export { dashboardRouter };