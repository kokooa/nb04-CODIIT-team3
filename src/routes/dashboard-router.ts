// src/routes/dashboard-router.ts
import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard-controller';
import { authenticate, authorize } from '../common/middlewares';
import { UserRole } from '@prisma/client';

const dashboardRouter = Router();

// 모든 대시보드 경로는 판매자(SELLER) 역할의 인증된 사용자만 접근 가능
dashboardRouter.use(authenticate, authorize([UserRole.SELLER]));

// 1. 기간별 판매 건수와 판매 금액 조회
dashboardRouter.get(
  '/summary',
  dashboardController.getSalesSummary
);

// 2. 많이 판매된 상품 TOP 5 조회
dashboardRouter.get(
  '/top-products',
  dashboardController.getTopProducts
);

// 3. 가격대별 매출 비중 조회
dashboardRouter.get(
  '/sales-by-price',
  dashboardController.getSalesByPriceRange
);

export { dashboardRouter };
