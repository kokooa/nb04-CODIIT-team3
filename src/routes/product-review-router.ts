import express from 'express';
import * as reviewController from '../controllers/review-controller.js';
import { authMiddleware } from '../common/middlewares.js';

const router = express.Router();

/* Review routes */
/****************************************/
router.get('/:productId/reviews', reviewController.getReviews);

router.post(
  '/:productId/reviews',
  authMiddleware,
  reviewController.createReview,
);
/****************************************/

export default router;
