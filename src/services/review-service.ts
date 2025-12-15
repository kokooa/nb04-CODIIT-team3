import { HttpError } from '../common/httpError.js';
import type {
  ReviewDetailParamsDto,
  ReviewDetailResponseDto,
  UpdateReviewParamsDto,
  UpdateReviewResponseDto,
} from '../dtos/review.dto.js';
import * as reviewRepository from '../repositories/review-repositories.js';

export const getReviewDetail = async (
  params: ReviewDetailParamsDto,
): Promise<ReviewDetailResponseDto> => {
  const { reviewId, userId } = params;

  // 리뷰 상세 조회
  const reviewDetail = await reviewRepository.fetchReviewDetailById(reviewId);

  if (!reviewDetail) {
    throw new HttpError('요청한 리소스를 찾을 수 없습니다.', 404);
  }

  if (reviewDetail.userId !== userId) {
    throw new HttpError('권한이 없습니다.', 403);
  }

  return reviewDetail;
};

export const updateReview = async (
  params: UpdateReviewParamsDto,
): Promise<UpdateReviewResponseDto> => {
  const { reviewId, userId, data } = params;

  // 리뷰 수정
  const updatedReview = await reviewRepository.updateReviewById(reviewId, data);

  if (!updatedReview) {
    throw new HttpError('요청한 리소스를 찾을 수 없습니다.', 404);
  }

  if (updatedReview.userId !== userId) {
    throw new HttpError('권한이 없습니다.', 403);
  }

  return updatedReview;
};

export const deleteReview = async (reviewId: string) => {
  // 리뷰 삭제
};

export const getReviews = async (productId: string) => {
  // 상품 리뷰 목록 조회
};

export const createReview = async (productId: string) => {
  // 상품 리뷰 작성
};
