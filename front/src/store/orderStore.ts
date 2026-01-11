import { CartItem } from "@/types/cart";
import { CreateOrderRequest, OrderItemRequest } from "@/types/order";
import { create } from "zustand";

interface OrderStore {
  // 선택된 장바구니 아이템들
  selectedItems: CartItem[];
  // 주문 정보
  orderInfo: {
    name: string;
    phone: string;
    address: string;
    addressDetail: string;
    usePoint: number;
  };
  // 액션
  setSelectedItems: (items: CartItem[]) => void;
  setOrderInfo: (info: Partial<OrderStore["orderInfo"]>) => void;
  // 주문 요청 데이터 생성
  getOrderRequest: () => CreateOrderRequest;
  // 스토어 초기화
  reset: () => void;
}

const initialState = {
  selectedItems: [],
  orderInfo: {
    name: "",
    phone: "",
    address: "",
    addressDetail: "",
    usePoint: 0,
  },
};

export const useOrderStore = create<OrderStore>((set, get) => ({
  ...initialState,

  setSelectedItems: (items) => set({ selectedItems: items }),

  setOrderInfo: (info) =>
    set((state) => ({
      orderInfo: { ...state.orderInfo, ...info },
    })),

  getOrderRequest: () => {
    const { selectedItems, orderInfo } = get();
    const orderItems: OrderItemRequest[] = selectedItems.map((item) => ({
      productId: item.productId,
      sizeId: item.sizeId,
      quantity: item.quantity,
    }));

    // 기본주소와 상세주소를 합쳐서 address로 전송
    const fullAddress = orderInfo.addressDetail
      ? `${orderInfo.address} ${orderInfo.addressDetail}`.trim()
      : orderInfo.address;

    return {
      name: orderInfo.name,
      phone: orderInfo.phone,
      address: fullAddress,
      usePoint: orderInfo.usePoint,
      orderItems,
    };
  },

  reset: () => set(initialState),
}));
