import { ProductInfoData } from "./Product";

export interface CartStore {
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

export interface CartSize {
  id: number;
  name: string;
  size: {
    en: string;
    ko: string;
  };
}

export interface CartStock {
  id: string;
  productId: string;
  sizeId: number;
  quantity: number;
  size: CartSize;
}

export interface CartProduct {
  id: string;
  storeId: string;
  name: string;
  price: number;
  image: string;
  discountRate: number;
  discountStartTime: string | null;
  discountEndTime: string | null;
  createdAt: string;
  updatedAt: string;
  reviewsRating: number;
  categoryId: string;
  store: CartStore;
  stocks: CartStock[];
}

export interface CartItem {
  size: string;
  id: string;
  cartId: string;
  productId: string;
  sizeId: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: CartProduct | ProductInfoData;
  checked?: boolean; // UI에서 사용할 체크 상태
}

export interface Cart {
  id: string;
  buyerId: string;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
}

export interface CartEditSize {
  size: string;
  sizeId: number;
  quantity: number;
}

export interface CartEdit {
  productId: string;
  sizes: CartEditSize[];
}
