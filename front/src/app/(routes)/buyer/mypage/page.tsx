"use client";

import MyPageMenu from "@/components/MyPageMenu";
import InterestStore from "@/components/buyer/InterestStore";
import MypageItemCard from "@/components/item/MypageItemCard";
import MypageHeader from "@/components/mypage/MypageHeader";
import { menuItems } from "@/data/buyerMenuItems";
import useIntersectionObserver from "@/hooks/useIntersection";
import { getAxiosInstance } from "@/lib/api/axiosInstance";
import { OrderItemResponse, OrdersResponse } from "@/types/order";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MyPage() {
  const axiosInstance = getAxiosInstance();
  const [selectedMenu, setSelectedMenu] = useState("mypage");
  const [showAllOrders, setShowAllOrders] = useState(false);
  const router = useRouter();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["mypage-orders", showAllOrders],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await axiosInstance.get<OrdersResponse>("/orders", {
        params: {
          status: "CompletedPayment",
          limit: 3,
          page: pageParam,
        },
      });

      // 모든 주문의 orderItems를 하나의 배열로 합치기
      const items: OrderItemResponse[] = data.data.flatMap((order) => order.orderItems);

      return {
        items,
        nextPage: pageParam < data.meta.totalPages ? pageParam + 1 : undefined,
        totalPages: data.meta.totalPages,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  const { setTarget } = useIntersectionObserver({
    hasNextPage: showAllOrders && hasNextPage,
    fetchNextPage,
  });

  const allItems = data?.pages.flatMap((page) => page.items) ?? [];
  const displayedItems = showAllOrders ? allItems : allItems.slice(0, 3);

  const handleShowMore = () => {
    setShowAllOrders(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex w-full max-w-[1520px] gap-10 pt-[3.75rem]">
        <MyPageMenu
          items={menuItems}
          selectedId={selectedMenu}
          onSelect={(id, path) => {
            setSelectedMenu(id);
            router.push(path);
          }}
          className="h-[280px] w-[218px] flex-shrink-0"
        />
        <div className="flex flex-1 flex-col gap-5">
          <MypageHeader />
          <div className="flex w-full flex-col gap-15">
            <div className="w-full">
              <div className="flex justify-between py-[0.5625rem]">
                <span className="text-black01 text-lg/5 font-extrabold">최근 주문</span>
                {!showAllOrders && allItems.length > 3 && (
                  <button
                    onClick={handleShowMore}
                    className="text-black01 cursor-pointer text-base/4.5 font-normal hover:underline"
                  >
                    더보기
                  </button>
                )}
              </div>
              {isLoading ? (
                <div className="flex justify-center py-8">로딩 중...</div>
              ) : displayedItems.length === 0 ? (
                <div className="flex justify-center py-8 text-gray-500">주문 내역이 없습니다.</div>
              ) : (
                <div className={`${showAllOrders ? "h-[600px] overflow-y-auto px-5" : ""}`}>
                  <MypageItemCard purchases={displayedItems} />
                  {showAllOrders && hasNextPage && (
                    <div
                      ref={setTarget}
                      className="flex h-20 items-center justify-center"
                    >
                      {isFetchingNextPage && "로딩 중..."}
                    </div>
                  )}
                </div>
              )}
            </div>
            <InterestStore />
          </div>
        </div>
      </div>
    </div>
  );
}
