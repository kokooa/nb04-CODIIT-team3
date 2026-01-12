import { BuyerOrderItem } from "@/types/buyerPurchase";

export const mypagepurchases: BuyerOrderItem[] = [
  {
    id: "1",
    price: 31800,
    quantity: 1,
    isReviewed: true,
    product: {
      id: "1",
      storeId: "1",
      name: "[단독특가] 카린 레더 자켓",
      price: 31800,
      image: "/images/Mask-group.svg",
      discountRate: 0,
      discountStartTime: "",
      discountEndTime: "",
      createdAt: "2023-11-18",
      updatedAt: "2023-11-18",
      store: {
        id: "1",
        userId: "1",
        name: "스토어1",
        address: "서울시",
        phoneNumber: "010-0000-0000",
        content: "",
        image: "",
        createdAt: "",
        updatedAt: "",
      },
      stocks: [],
    },
    size: {
      id: 1,
      size: {
        en: "FREE",
        ko: "FREE",
      },
    },
    rating: 4.5,
    reviewer: "이유지",
    reviewDate: "2023-11-24",
    reviewContent: "촌스럽지 않은 색상과 은은한 광택의 레더 소재가 좋았어요. 생각보다 오버핏이라 입었을 때 편안합니다.",
  },
  {
    id: "2",
    price: 14000,
    quantity: 5,
    isReviewed: false,
    product: {
      id: "2",
      storeId: "1",
      name: "겨울 따뜻한 두꺼운 장목 양말 10colors",
      price: 14000,
      image: "/images/Mask-group.svg",
      discountRate: 0,
      discountStartTime: "",
      discountEndTime: "",
      createdAt: "2023-11-12",
      updatedAt: "2023-11-12",
      store: {
        id: "1",
        userId: "1",
        name: "스토어1",
        address: "서울시",
        phoneNumber: "010-0000-0000",
        content: "",
        image: "",
        createdAt: "",
        updatedAt: "",
      },
      stocks: [],
    },
    size: {
      id: 2,
      size: {
        en: "M",
        ko: "M",
      },
    },
  },
  {
    id: "3",
    price: 14000,
    quantity: 5,
    isReviewed: false,
    product: {
      id: "3",
      storeId: "1",
      name: "겨울 따뜻한 두꺼운 장목 양말 10colors",
      price: 14000,
      image: "/images/Mask-group.svg",
      discountRate: 0,
      discountStartTime: "",
      discountEndTime: "",
      createdAt: "2023-11-12",
      updatedAt: "2023-11-12",
      store: {
        id: "1",
        userId: "1",
        name: "스토어1",
        address: "서울시",
        phoneNumber: "010-0000-0000",
        content: "",
        image: "",
        createdAt: "",
        updatedAt: "",
      },
      stocks: [],
    },
    size: {
      id: 2,
      size: {
        en: "M",
        ko: "M",
      },
    },
  },
];

// 주문 상태 정보를 포함하는 타입 확장
export interface MypageOrderItem extends BuyerOrderItem {
  orderStatus: "CompletedPayment" | "Cancelled" | "Processing" | "Shipped";
}

// 주문 상태 정보를 추가한 데이터
export const mypageOrderItems: MypageOrderItem[] = mypagepurchases.map((item, index) => ({
  ...item,
  orderStatus: index === 0 ? "CompletedPayment" : index === 1 ? "CompletedPayment" : "Cancelled",
}));
