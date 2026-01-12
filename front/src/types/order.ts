export interface OrderItem {
  id: string;
  price: number;
  quantity: number;
  isReviewed: boolean;
  productId: string;
  product: {
    name: string;
    reviews: Array<{
      id: string;
      rating: number;
      content: string;
      createdAt: string;
    }>;
  };
  size: {
    size: {
      en: string;
      ko: string;
    };
  };
}

export interface Order {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
  subtotal: number;
  totalQuantity: number;
  usePoint: number;
  createdAt: string;
  orderItems: OrderItem[];
  payments: {
    id: string;
    price: number;
    status: string;
    createdAt: string;
  };
}

export interface OrdersResponse {
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface OrderItemRequest {
  productId: string;
  sizeId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  name: string;
  phone: string;
  address: string;
  orderItems: OrderItemRequest[];
  usePoint: number;
}

export interface OrderItemResponse {
  id: string;
  price: number;
  quantity: number;
  isReviewed: boolean;
  productId: string;
  product: {
    name: string;
    image?: string;
    reviews: {
      id: string;
      rating: number;
      content: string;
      createdAt: string;
    }[];
  };
  size: {
    size: {
      en: string;
      ko: string;
    };
  };
}
