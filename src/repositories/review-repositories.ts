import prisma from '../common/prisma.js';
import type {
  GetReviewsParamsDto,
  CreateReviewParamsDto,
} from '../dtos/review.dto.js';

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
    select: {
      id: true,
      userId: true,
      productId: true,
      content: true,
      rating: true,
      createdAt: true,
      updatedAt: true,
      orderItemId: true,
      user: {
        select: {
          name: true,
        },
      },
    },
    skip,
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
  });

  return reviews;
};

export const fetchTotalReviewsByProductId = async (productId: string) => {
  const total = await prisma.review.count({
    where: {
      productId,
    },
  });

  return total;
};

export const createReview = async (params: CreateReviewParamsDto) => {
  const { productId, userId, data } = params;

  const createdReview = await prisma.review.create({
    data: {
      ...data,
      productId,
      userId,
    },
  });

  return createdReview;
};

/**
 * 주문 상품 정보 조회 (구매 여부 확인용)
 * @param orderItemId string
 */
export const fetchOrderItem = async (orderItemId: string) => {
  const orderItem = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: { order: true },
  });

  return orderItem;
};

/**
 * 이미 작성된 리뷰가 있는지 확인
 * @param orderItemId string
 */
export const checkReviewExists = async (orderItemId: string) => {
  const review = await prisma.review.findFirst({
    where: { orderItemId },
  });

  return !!review;
};
