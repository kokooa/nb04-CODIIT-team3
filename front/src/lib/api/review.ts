import { ReviewsResponse } from "@/types/Review";
import { getAxiosInstance } from "./axiosInstance";

interface GetReviewListParams {
  productId: string;
  limit?: number;
  page?: number;
}

export const getReviewList = async (params: GetReviewListParams): Promise<ReviewsResponse> => {
  const axiosInstance = getAxiosInstance();
  const { productId, ...rest } = params;
  const response = await axiosInstance.get(`/product/${productId}/reviews`, { params: rest });
  return response.data;
};
