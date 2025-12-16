import { HttpError } from '../common/httpError.js';
import prisma from '../common/prisma.js';
import type { GetReviewsParamsDto } from '../dtos/review.dto.js';

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

export const updateReviewById = async (reviewId: string, data: any) => {
  const updatedReview = await prisma.review.update({
    where: {
      id: reviewId,
    },
    data,
  });

  return updatedReview;
};

export const deleteReviewById = async (reviewId: string) => {
  const deletedReview = await prisma.review.delete({
    where: {
      id: reviewId,
    },
  });

  return deletedReview;
};

export const fetchReviewsByProductId = async (params: GetReviewsParamsDto) => {
  const { productId, limit, page } = params;

  const skip = (page - 1) * limit;
  const reviews = await prisma.review.findMany({
    where: {
      productId,
    },
    skip,
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
  });

  return reviews;
};
