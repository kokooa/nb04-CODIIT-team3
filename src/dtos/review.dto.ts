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
  data: {
    rating: number;
  };
}

/* ------------------------------------------------------- */

export type DeleteReviewResponseDto = [
  {
    id: string;
    userId: string;
    productId: string;
    content: string;
    rating: number;
    createdAt: Date;
    updatedAt: Date;
    orderItemId: string;
  },
  {
    id: string;
    orderId: string;
    productId: string;
    size: string;
    price: number;
    quantity: number;
    isReviewed: boolean;
  },
];

export interface DeleteReviewParamsDto {
  reviewId: string;
  userId: string;
}

/* ------------------------------------------------------- */

export interface GetReviewsParamsDto {
  productId: string;
  limit: number;
  page: number;
  userId: string;
}

export type GetReviewsResponseDto = {
  items: {
    id: string;
    userId: string;
    productId: string;
    content: string;
    rating: number;
    createdAt: Date;
    updatedAt: Date;
    orderItemId: string;
    user: {
      name: string;
    };
  }[];
  meta: {
    total: number;
    page: number;
    limit: number;
    hasNextPage: boolean;
  };
};

/* ------------------------------------------------------- */

export interface CreateReviewParamsDto {
  productId: string;
  userId: string;
  data: {
    rating: number;
    content: string;
    orderItemId: string;
  };
}

export interface CreateReviewResponseDto {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  content: string;
  createdAt: Date;
}

/* ------------------------------------------------------- */
