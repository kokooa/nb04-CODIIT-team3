import { BuyerOrder } from "@/types/buyerPurchase";

export const Buyerpurchases: BuyerOrder[] = [
  {
    id: "order-1",
    name: "홍길동",
    phoneNumber: "010-1234-5678",
    address: "서울시 강남구 테헤란로 123",
    subtotal: 70000,
    totalQuantity: 6,
    usePoint: 1000,
    createdAt: "2025-06-09T08:53:43.382Z",
    orderItems: [
      {
        id: "orderItem-1",
        price: 31800,
        quantity: 1,
        isReviewed: true,
        product: {
          id: "product-1",
          storeId: "store-1",
          name: "[단독특가] 카린 레더 자켓",
          price: 31800,
          image: "/images/Mask-group.svg",
          discountRate: 0,
          discountStartTime: "2025-06-01T00:00:00.000Z",
          discountEndTime: "2025-06-30T23:59:59.999Z",
          createdAt: "2025-05-01T12:00:00.000Z",
          updatedAt: "2025-06-01T12:00:00.000Z",
          store: {
            id: "store-1",
            userId: "user-1",
            name: "코디잇샵",
            address: "서울시 강남구",
            phoneNumber: "02-123-4567",
            content: "트렌디한 의류샵",
            image: "/images/store.jpg",
            createdAt: "2025-01-01T00:00:00.000Z",
            updatedAt: "2025-06-01T12:00:00.000Z",
          },
          stocks: [
            {
              id: "stock-1",
              productId: "product-1",
              sizeId: 1,
              quantity: 10,
              size: {
                id: 1,
                size: {
                  en: "FREE",
                  ko: "프리사이즈",
                },
              },
            },
          ],
        },
        size: {
          id: 1,
          size: {
            en: "FREE",
            ko: "프리사이즈",
          },
        },
        rating: 4.5,
        reviewer: "이유지",
        reviewDate: "2023-11-24",
        reviewContent:
          "촌스럽지 않은 색상과 은은한 광택의 레더 소재가 좋았어요. 생각보다 오버핏이라 입었을 때 편안합니다.",
      },
      {
        id: "orderItem-2",
        price: 14000,
        quantity: 5,
        isReviewed: false,
        product: {
          id: "product-2",
          storeId: "store-2",
          name: "겨울 따뜻한 두꺼운 장목 양말 10colors",
          price: 14000,
          image: "/images/Mask-group.svg",
          discountRate: 0,
          discountStartTime: "2025-06-01T00:00:00.000Z",
          discountEndTime: "2025-06-30T23:59:59.999Z",
          createdAt: "2025-05-01T12:00:00.000Z",
          updatedAt: "2025-06-01T12:00:00.000Z",
          store: {
            id: "store-2",
            userId: "user-2",
            name: "양말샵",
            address: "서울시 강남구",
            phoneNumber: "02-987-6543",
            content: "따뜻한 양말 전문점",
            image: "/images/store2.jpg",
            createdAt: "2025-01-01T00:00:00.000Z",
            updatedAt: "2025-06-01T12:00:00.000Z",
          },
          stocks: [
            {
              id: "stock-2",
              productId: "product-2",
              sizeId: 2,
              quantity: 100,
              size: {
                id: 2,
                size: {
                  en: "M",
                  ko: "미디움",
                },
              },
            },
          ],
        },
        size: {
          id: 2,
          size: {
            en: "M",
            ko: "미디움",
          },
        },
      },
    ],
    payments: {
      id: "payment-1",
      price: 70000,
      status: "CompletedPayment",
      createdAt: "2025-06-09T08:53:43.382Z",
    },
  },
];
