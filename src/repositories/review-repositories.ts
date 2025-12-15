import { HttpError } from '../common/httpError.js';
import prisma from '../common/prisma.js';
import type {} from '../dtos/review.dto.js';

/**
 * reviewId로 상세 리뷰 조회
 * @param reviewId string
 */
export const fetchReviewDetailById = async (reviewId: string) => {
  const review = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
    select: {
      id: true,
      userId: true,
      productId: true,
      rating: true,
      content: true,
      createdAt: true,
    },
  });

  return review;
};
