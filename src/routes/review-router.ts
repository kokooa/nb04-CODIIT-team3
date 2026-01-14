import express from 'express';
import * as reviewController from '../controllers/review-controller.js';
import { authMiddleware } from '../common/middlewares.js';

const router = express.Router();

// 리뷰 상세 조회 (리뷰ID)
// router.get('/:reviewId', reviewController.getReviewDetail);

// 리뷰 수정 (리뷰ID)
// router.patch('/:reviewId', reviewController.updateReview);

// 리뷰 삭제 (리뷰ID)
router.delete('/:reviewId', authMiddleware, reviewController.deleteReview);

// 상품 리뷰 목록 조회 (페이지네이션 포함/상품ID)
// router.get('/product/:productId/reviews', reviewController.getReviews);

// 상품 리뷰 작성 (상품ID)
/* router.post(
  '/product/:productId/reviews',
  authMiddleware,
  reviewController.createReview,
); */

export default router;
