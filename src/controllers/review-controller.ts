import type { Request, Response, NextFunction } from 'express';
import type { ReviewDetailParamsDto } from '../dtos/review.dto.js';
import { HttpError } from '../common/httpError.js';
import * as reviewService from '../services/review-service.js';

/**
 * 리뷰 상세 조회 (리뷰ID)
 * 리뷰 ID를 사용하여 리뷰의 상세 정보를 조회합니다. 리뷰 작성자, 내용, 평점 등의 정보를 포함합니다.
 */
export const getReviewDetail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { reviewId } = req.params;

  // 파라미터 유효성 검증
  if (!reviewId) {
    return next(new HttpError('reviewId가 없거나 잘못되었습니다.', 400));
  }

  // User 정보 받아오기 및 유효성 검증
  const userId = 'abcd1234abcd1234abcd1234'; // TODO: 인증 미들웨어 구현 후 수정 필요
  if (!userId) {
    return next(new HttpError('인증이 필요합니다.', 401));
  }

  const params: ReviewDetailParamsDto = {
    reviewId,
    userId,
  };

  // 리뷰 상세 조회
  try {
    const result = await reviewService.getReviewDetail(params);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * 리뷰 수정 (리뷰ID)
 * 리뷰 ID를 사용하여 리뷰를 수정합니다.
 */
export const updateReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { reviewId } = req.params;
  const data = req.body as {
    rating: number;
  };

  // 파라미터 유효성 검증
  if (!reviewId) {
    return next(new HttpError('reviewId가 없거나 잘못되었습니다.', 400));
  }

  // User 정보 받아오기 및 유효성 검증
  const userId = 'abcd1234abcd1234abcd1234'; // TODO: 인증 미들웨어 구현 후 수정 필요
  if (!userId) {
    return next(new HttpError('인증이 필요합니다.', 401));
  }

  const params = {
    reviewId,
    userId,
    data,
  };

  try {
    const result = await reviewService.updateReview(params);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * 리뷰 삭제 (리뷰ID)
 * 리뷰 ID를 사용하여 리뷰를 삭제합니다. 삭제된 리뷰는 더 이상 조회할 수 없습니다.
 */
export const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { reviewId } = req.params;

  // 파라미터 유효성 검증
  if (!reviewId) {
    return next(new HttpError('reviewId가 없거나 잘못되었습니다.', 400));
  }

  // User 정보 받아오기 및 유효성 검증
  const userId = 'abcd1234abcd1234abcd1234'; // TODO: 인증 미들웨어 구현 후 수정 필요
  if (!userId) {
    return next(new HttpError('인증이 필요합니다.', 401));
  }

  const params = {
    reviewId,
    userId,
  };

  try {
    await reviewService.deleteReview(params);

    res.status(200).end();
  } catch (error) {
    next(error);
  }
};

/**
 * 상품 리뷰 목록 조회 (페이지네이션 포함/상품ID)
 * 상품 ID를 사용하여 해당 상품의 리뷰 목록을 페이지네이션과 함께 조회합니다.
 */
export const getReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {};

/**
 * 상품 리뷰 작성 (상품ID)
 * 상품 ID를 사용하여 리뷰를 작성합니다.
 */
export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // 상품 리뷰 작성
};
