export interface BuyerOrder {
  id: string;
  name: string;
  phoneNumber: string;
  address: string;
  subtotal: number;
  totalQuantity: number;
  usePoint: number;
  createdAt: string;
  orderItems: BuyerOrderItem[];
  payments: BuyerPayment;
}

export interface BuyerOrderItem {
  id: string;
  price: number;
  quantity: number;
  product: BuyerProduct;
  size: BuyerSize;
  isReviewed: boolean;
  // 리뷰 관련 mock 필드(실제 API에는 없을 수 있음)
  rating?: number;
  reviewer?: string;
  reviewDate?: string;
  reviewContent?: string;
}

export interface BuyerProduct {
  id: string;
  storeId: string;
  name: string;
  price: number;
  image: string;
  discountRate: number;
  discountStartTime: string;
  discountEndTime: string;
  createdAt: string;
  updatedAt: string;
  store: BuyerStore;
  stocks: BuyerStock[];
}

export interface BuyerStore {
  id: string;
  userId: string;
  name: string;
  address: string;
  phoneNumber: string;
  content: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface BuyerStock {
  id: string;
  productId: string;
  sizeId: number;
  quantity: number;
  size: BuyerSize;
}

export interface BuyerSize {
  id: number;
  size: {
    en: string;
    ko: string;
  };
}

export interface BuyerPayment {
  id: string;
  price: number;
  status: string;
  createdAt: string;
}
