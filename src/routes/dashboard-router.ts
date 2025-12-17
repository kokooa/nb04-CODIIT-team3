import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard-controller.js';
import { authenticate, authorize } from '../common/middlewares.js';
import { UserRole } from '@prisma/client';

const dashboardRouter = Router();

dashboardRouter.get(
  '/',
  authenticate,
  authorize([UserRole.SELLER]),
  dashboardController.getAggregatedData
);

export { dashboardRouter };