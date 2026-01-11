import { CartStore } from "./cart";
import { InquiryData } from "./inquiry";

// 상품 사이즈 type
export type Size = "Free" | "XS" | "S" | "M" | "L" | "XL";

// 상품 옵션 interface
export interface ProductOption {
  size: Size;
  count: number;
}

// 상품 리스트
export interface Product {
  id: string;
  storeId: string;
  storeName: string;
  name: string;
  image: string;
  price: number;
  discountPrice: number;
  discountRate: number;
  discountStartTime: string | null;
  discountEndTime: string | null;
  reviewsCount: number;
  reviewsRating: number;
  createdAt: string;
  updatedAt: string;
  sales: number;
}

// 상품 리스트 response
export interface ProductListResponse {
  list: Product[];
  totalCount: number;
}

interface StockSize {
  id: number;
  name: string;
}

// 재고
export interface Stock {
  id: string;
  quantity: number;
  size: StockSize;
}

interface Category {
  id: string;
  name: string;
}

export interface ReviewCount {
  rate1Length: number;
  rate2Length: number;
  rate3Length: number;
  rate4Length: number;
  rate5Length: number;
  sumScore: number;
}

export interface ProductInfoData {
  id: string;
  name: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  reviewsRating: number;
  content: string;
  storeId: string;
  storeName: string;
  price: number;
  discountPrice: number;
  discountRate: number;
  discountStartTime: string;
  discountEndTime: string;
  reviewsCount: number;
  reviews: ReviewCount;
  inquiries: InquiryData[];
  category: Category;
  stocks: Stock[];
  store?: CartStore;
}

// 카테고리
export type CategoryType = "TOP" | "BOTTOM" | "DRESS" | "OUTER" | "SKIRT" | "SHOES" | "ACC";
