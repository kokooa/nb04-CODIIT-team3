import { HttpError } from '../common/http-error.js';
import type {
  ReviewDetailParamsDto,
  ReviewDetailResponseDto,
  UpdateReviewParamsDto,
  UpdateReviewResponseDto,
  DeleteReviewParamsDto,
  GetReviewsParamsDto,
  GetReviewsResponseDto,
  CreateReviewParamsDto,
  CreateReviewResponseDto,
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

export const deleteReview = async (
  params: DeleteReviewParamsDto,
): Promise<boolean> => {
  // 삭제하려는 리뷰가 본인이 작성한 것인지 검증
  const review = await reviewRepository.fetchReviewDetailById(
    params.reviewId,
  );

  if (!review) {
    throw new HttpError('요청한 리소스를 찾을 수 없습니다.', 404);
  }

  if (review.userId !== params.userId) {
    throw new HttpError('권한이 없습니다.', 403);
  }

  // 리뷰 삭제
  const deletedReview = await reviewRepository.deleteReviewById(
    params.reviewId,
  );

  if (!deletedReview) {
    throw new HttpError('요청한 리소스를 찾을 수 없습니다.', 404);
  }

  if (deletedReview.userId !== params.userId) {
    throw new HttpError('권한이 없습니다.', 403);
  }

  return deletedReview ? true : false;
};

export const getReviews = async (
  params: GetReviewsParamsDto,
): Promise<GetReviewsResponseDto> => {
  const { userId } = params;

  const reviews = reviewRepository.fetchReviewsByProductId(params);

  return reviews;
};

export const createReview = async (
  params: CreateReviewParamsDto,
): Promise<CreateReviewResponseDto> => {
  const { productId, userId, data } = params;

  // 주문 내역 유효성 검사 (구매 여부 및 본인 확인)
  const orderItem = await reviewRepository.fetchOrderItem(data.orderItemId);

  if (!orderItem) {
    throw new HttpError('주문 내역을 찾을 수 없습니다.', 404);
  }
  if (orderItem.productId !== productId) {
    throw new HttpError('해당 상품에 대한 주문 내역이 아닙니다.', 400);
  }
  if (orderItem.order.userId !== userId) {
    throw new HttpError('본인의 주문 내역에 대해서만 리뷰를 작성할 수 있습니다.', 403);
  }

  // 중복 리뷰 검사
  const reviewExists = await reviewRepository.checkReviewExists(data.orderItemId);
  if (reviewExists) {
    throw new HttpError('이미 해당 주문 내역에 대한 리뷰를 작성했습니다.', 409);
  }

  // 리뷰 작성
  const createdReview = await reviewRepository.createReview(params);

  if (!createdReview) {
    throw new HttpError('리뷰 작성에 실패했습니다.', 500);
  }

  return createdReview;
};
