"use client";

import MyPageMenu from "@/components/MyPageMenu";
import Tab from "@/components/Tab";
import ItemCard from "@/components/item/ItemCard";
import { menuItems } from "@/data/buyerMenuItems";
import { tabList } from "@/data/reviewTabList";
import useIntersectionObserver from "@/hooks/useIntersection";
import { getAxiosInstance } from "@/lib/api/axiosInstance";
import { OrderItemResponse, OrdersResponse } from "@/types/order";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ReviewPage() {
  const axiosInstance = getAxiosInstance();
  const [selectedTab, setSelectedTab] = useState<"all" | "writable" | "done">("all");
  const [selectedMenu, setSelectedMenu] = useState("purchases");
  const router = useRouter();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["orders", selectedTab],
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

      // 탭에 따라 아이템 필터링
      const filteredItems = items.filter((item) => {
        switch (selectedTab) {
          case "writable":
            return !item.isReviewed;
          case "done":
            return item.isReviewed;
          default:
            return true;
        }
      });

      return {
        items: filteredItems,
        nextPage: pageParam < data.meta.totalPages ? pageParam + 1 : undefined,
        totalPages: data.meta.totalPages,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  const { setTarget } = useIntersectionObserver({
    hasNextPage,
    fetchNextPage,
  });

  const allItems = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="mb-20 min-h-screen bg-white">
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
        <main className="flex flex-1 flex-col gap-[1.875rem]">
          <div className="flex flex-col gap-5">
            <div className="text-2xl font-bold">내 구매 목록</div>
            <Tab
              tabs={tabList}
              value={selectedTab}
              onChange={(key) => setSelectedTab(key as typeof selectedTab)}
            />
          </div>
          <div className="flex w-full flex-col gap-5">
            {isLoading ? (
              <div className="flex justify-center py-8">로딩 중...</div>
            ) : allItems.length === 0 ? (
              <div className="flex justify-center py-8 text-gray-500">
                {selectedTab === "writable"
                  ? "작성 가능한 리뷰가 없습니다."
                  : selectedTab === "done"
                    ? "작성한 리뷰가 없습니다."
                    : "구매 내역이 없습니다."}
              </div>
            ) : (
              <>
                <ItemCard purchases={allItems} />
                {hasNextPage && (
                  <div
                    ref={setTarget}
                    className="flex h-20 items-center justify-center"
                  >
                    {isFetchingNextPage && "로딩 중..."}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
