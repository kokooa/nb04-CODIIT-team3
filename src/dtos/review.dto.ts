/* ------------------------------------------------------- */
// DTOs for Review

export interface ReviewDetailResponseDto {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  content: string;
  createdAt: Date;
}

export interface ReviewDetailParamsDto {
  reviewId: string;
  userId: string;
}

/* ------------------------------------------------------- */

export interface UpdateReviewResponseDto {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  content: string;
  createdAt: Date;
}

export interface UpdateReviewParamsDto {
  reviewId: string;
  userId: string;
  data: any;
}
