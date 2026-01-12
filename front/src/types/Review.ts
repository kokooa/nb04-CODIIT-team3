export interface ReviewData {
  id: string;
  userId: string;
  productId: string;
  content: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
  orderItemId: string;
  user: { name: string };
}

export interface ReviewMetaData {
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}

export interface ReviewsResponse {
  items: ReviewData[];
  meta: ReviewMetaData;
}
