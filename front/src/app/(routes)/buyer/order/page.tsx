"use client";

import OrderInfoSection from "@/components/order/OrderInfoSection";
import OrderPointSection from "@/components/order/OrderPointSection";
import OrderProductList from "@/components/order/OrderProductList";
import OrderSummary from "@/components/order/OrderSummary";
import { getAxiosInstance } from "@/lib/api/axiosInstance";
import { useOrderStore } from "@/store/orderStore";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function OrderPage() {
  const axiosInstance = getAxiosInstance();
  const router = useRouter();
  const { selectedItems, getOrderRequest, reset } = useOrderStore();
  const isOrderCompleted = useRef(false);

  // 선택된 아이템이 없으면 장바구니 페이지로 리다이렉트
  useEffect(() => {
    if (selectedItems.length === 0 && !isOrderCompleted.current) {
      router.replace("/buyer/shopping");
    }
  }, [selectedItems, router]);

  // 장바구니 아이템 삭제 mutation
  const deleteCartItemsMutation = useMutation({
    mutationFn: async () => {
      const deletePromises = selectedItems.map((item) => axiosInstance.delete(`/cart/${item.id}`));
      await Promise.all(deletePromises);
    },
  });

  // 주문 생성 mutation
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const orderData = getOrderRequest();
      await axiosInstance.post("/orders", orderData);
    },
    onSuccess: async () => {
      try {
        // 주문 성공 후 장바구니에서 주문한 아이템들 삭제
        await deleteCartItemsMutation.mutateAsync();
        isOrderCompleted.current = true; // 주문 완료 플래그 설정
        reset();
        router.replace("/buyer/mypage");
      } catch (error) {
        console.error("장바구니 아이템 삭제 중 오류 발생:", error);
        // 장바구니 삭제 실패해도 주문은 성공했으므로 마이페이지로 이동
        isOrderCompleted.current = true; // 주문 완료 플래그 설정
        reset();
        router.replace("/buyer/mypage");
      }
    },
  });

  return (
    <div>
      <div className="mx-auto h-full max-w-[1520px] bg-white pt-8">
        <div className="flex items-center gap-5">
          <h1 className="text-black01 flex items-center text-[1.75rem] font-extrabold">주문 및 결제</h1>
        </div>
        <div className="mt-8 flex gap-15">
          {/* 왼쪽: 주문 정보, 상품, 포인트 */}
          <div className="flex-1">
            <OrderInfoSection />
            <OrderProductList />
            <OrderPointSection />
          </div>

          {/* 오른쪽: 결제 요약 및 버튼 */}
          <OrderSummary onClick={() => createOrderMutation.mutate()} />
        </div>
      </div>
    </div>
  );
}
