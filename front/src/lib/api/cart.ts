import { Cart, CartEdit, CartItem } from "@/types/cart";
import { getAxiosInstance } from "./axiosInstance";

// 장바구니 생성
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const postCart = async (body: any) => {
  const axiosInstance = getAxiosInstance();

  // 주소 뒤에 body(데이터)를 실어서 보냄
  const response = await axiosInstance.post(`/cart`, body);
  return response.data;
};

// 장바구니 수정(아이템 추가 / 아이템 수량 수정)
export const patchCart = async (body: CartEdit): Promise<CartItem[]> => {
  const axiosInstance = getAxiosInstance();
  const response = await axiosInstance.patch(`/cart`, body);
  return response.data;
};

export const getCart = async (): Promise<Cart> => {
  const axiosInstance = getAxiosInstance();
  const response = await axiosInstance.get(`/cart`);
  return response.data;
};
