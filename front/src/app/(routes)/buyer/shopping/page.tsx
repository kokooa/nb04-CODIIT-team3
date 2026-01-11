"use client";

import Button from "@/components/button/Button";
import CartItemCard from "@/components/shopping/CartItemCard";
import { getAxiosInstance } from "@/lib/api/axiosInstance";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import { useOrderStore } from "@/store/orderStore";
import { Cart } from "@/types/cart";
import { ProductInfoData } from "@/types/Product";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ShoppingPage() {
  const axiosInstance = getAxiosInstance();
  const router = useRouter();
  const queryClient = useQueryClient();
  const toaster = useToaster();
  const setSelectedItems = useOrderStore((state) => state.setSelectedItems);
  const { data: cartData, isLoading } = useQuery<Cart>({
    queryKey: ["cart"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<Cart>("/cart");
      // 각 아이템에 checked 상태 추가
      return {
        ...data,
        items: data.items.map((item) => ({ ...item, checked: false })),
      };
    },
  });

  const cart = cartData?.items ?? [];

  // 전체 옵션이 모두 체크된 경우만 true
  const allChecked = cart.every((item) => item.checked);

  // 전체선택/해제
  const handleAllCheck = () => {
    if (!cartData) return;
    queryClient.setQueryData<Cart>(["cart"], {
      ...cartData,
      items: cartData.items.map((item) => ({ ...item, checked: !allChecked })),
    });
  };

  // 상품별 체크/해제
  const handleItemCheck = (itemId: string) => {
    if (!cartData) return;
    queryClient.setQueryData<Cart>(["cart"], {
      ...cartData,
      items: cartData.items.map((item) => (item.id === itemId ? { ...item, checked: !item.checked } : item)),
    });
  };

  // 선택 삭제: 체크된 아이템만 삭제
  const deleteMutation = useMutation({
    mutationFn: async (itemIds: string[]) => {
      await Promise.all(itemIds.map((id) => axiosInstance.delete(`/cart/${id}`)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const handleDelete = () => {
    const selectedItems = cart.filter((item) => item.checked).map((item) => item.id);
    if (selectedItems.length > 0) {
      deleteMutation.mutate(selectedItems);
    }
  };

  // 수량 변경
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, sizeId, quantity }: { productId: string; sizeId: number; quantity: number }) => {
      await axiosInstance.patch(`/cart`, {
        productId,
        sizes: [
          {
            sizeId,
            quantity,
          },
        ],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error: unknown) => {
      if (error && typeof error === "object" && "response" in error) {
        const response = (error as { response?: { status?: number } }).response;
        if (response?.status === 400) {
          const message = "해당 사이즈의 재고가 더 이상 존재하지 않습니다.";
          toaster("warn", message);
        }
      }
    },
  });

  // 개별 아이템 삭제
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await axiosInstance.delete(`/cart/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  // 총 결제금액 계산: 체크된 아이템만 합산
  const total = cart
    .filter((item) => item.checked)
    .reduce((sum, item) => {
      const price = item.product.price;
      const discountRate = item.product.discountRate;
      const discountedPrice = Math.floor((item.product as ProductInfoData).discountPrice ?? price * (1 - discountRate / 100));
      const itemTotal = discountedPrice * item.quantity;
      return sum + itemTotal;
    }, 0);

  const handleOrder = () => {
    // 체크된 아이템들만 필터링
    const selectedItems = cart.filter((item) => item.checked);

    // 재고 확인
    const outOfStockItems = selectedItems.filter((item) => {
      const stock = item.product.stocks.find((stock) => stock.size.id === item.sizeId);
      return !stock || stock.quantity < item.quantity;
    });

    if (outOfStockItems.length > 0) {
      // 재고가 없는 상품이 있는 경우
      const itemNames = outOfStockItems.map((item) => item.product.name).join(", ");
      toaster("warn", `${itemNames}의 재고가 부족합니다.`);
      return;
    }

    // store에 선택된 아이템들 저장
    setSelectedItems(selectedItems);
    // 결제 페이지로 이동
    router.push("/buyer/order");
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">로딩 중...</div>;
  }

  return (
    <div className="mx-auto max-w-[1520px] px-4 py-10">
      <h2 className="mb-8 text-2xl font-extrabold">장바구니</h2>
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={handleAllCheck}
          className="flex items-center gap-3"
        >
          <Image
            src="/icon_check.svg"
            alt="check"
            width={32}
            height={32}
            className={`text-white ${allChecked ? "" : "opacity-20"}`}
          />
          <span className="text-lg font-medium">모두선택</span>
        </button>
        <button
          className="text-gray01 text-base"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending ? "삭제 중..." : "선택삭제"}
        </button>
      </div>
      <div className="space-y-6">
        {cart.map((item) => (
          <CartItemCard
            key={item.id}
            item={item}
            isChecked={item.checked ?? false}
            onCheck={() => handleItemCheck(item.id)}
            onQuantityChange={(quantity: number) =>
              updateQuantityMutation.mutate({
                productId: item.productId,
                sizeId: item.sizeId,
                quantity,
              })
            }
            onDelete={() => deleteItemMutation.mutate(item.id)}
          />
        ))}
      </div>
      <div className="mt-10 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <span className="text-black01 text-lg font-extrabold">총 결제금액</span>
          <span className="text-black01 text-[2.625rem] font-extrabold">{total.toLocaleString()}원</span>
        </div>
        <Button
          label="주문하기"
          size="large"
          variant="primary"
          color="black"
          className="h-[5.3125rem] w-[25rem]"
          disabled={!cart.some((item) => item.checked)}
          onClick={handleOrder}
        />
      </div>
    </div>
  );
}
