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
