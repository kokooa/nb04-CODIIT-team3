import { ProductInfoData, ProductListResponse } from "@/types/Product";
import { ProductInquiryResponse } from "@/types/inquiry";
import { toProductFormData } from "@/utils/formData/toProductFormData";
import { ProductFormValues } from "../schemas/productForm.schema";
import { getAxiosInstance } from "./axiosInstance";

interface GetProductsParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  search?: string;
  priceMin?: number;
  priceMax?: number;
  size?: string;
  favoriteStore?: string;
  categoryName?: string;
}

interface GetProductInquiryParams {
  page?: number;
  pageSize?: number;
  sort?: "oldest" | "recent";
  status?: "CompletedAnswer" | "WaitingAnswer";
}

// 새 상품 등록
export const createProduct = async (data: ProductFormValues): Promise<ProductInfoData> => {
  const axiosInstance = getAxiosInstance();
  const formData = toProductFormData(data);
  const response = await axiosInstance.post("/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// 상품 목록 조회
export const getProducts = async (params: GetProductsParams): Promise<ProductListResponse> => {
  const axiosInstance = getAxiosInstance();
  const { priceMax, ...rest } = params;
  const queryParams = {
    ...rest,
    ...(priceMax && priceMax !== 0 ? { priceMax } : {}),
  };
  const response = await axiosInstance.get("/products", { params: queryParams });
  return response.data;
};

// 상품 수정 patch
export const updateProduct = async (productId: string, data: ProductFormValues) => {
  const axiosInstance = getAxiosInstance();
  const formData = toProductFormData(data);
  const response = await axiosInstance.patch(`/products/${productId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// 상품 정보 조회
export const getProductDetail = async (productId: string): Promise<ProductInfoData> => {
  const axiosInstance = getAxiosInstance();
  const response = await axiosInstance.get(`/products/${productId}`);
  return response.data;
};

// 상품 삭제
export const deleteProduct = async (productId: string) => {
  const axiosInstance = getAxiosInstance();
  const response = await axiosInstance.delete(`/products/${productId}`);
  return response.data;
};

// 상품 문의 조회
export const getProductInquiry = async (productId: string, query: GetProductInquiryParams): Promise<ProductInquiryResponse> => {
  const axiosInstance = getAxiosInstance();
  const response = await axiosInstance.get(`/products/${productId}/inquiries`, { params: query });
  return response.data;
};

export interface PostInquiryParams {
  productId: string;
  title: string;
  content: string;
  isSecret: boolean;
}

// 상품 문의 등록
export const postProductInquiry = async ({ productId, ...body }: PostInquiryParams) => {
  const axiosInstance = getAxiosInstance();
  const response = await axiosInstance.post(`/products/${productId}/inquiries`, body);
  return response.data;
};

// 상품 등록 - 이미지
export const uploadImageToS3 = async (file: File): Promise<{ url: string }> => {
  const axiosInstance = getAxiosInstance();
  const formData = new FormData();
  formData.append("image", file);

  const response = await axiosInstance.post("/s3/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
