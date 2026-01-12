"use client";

import MyPageMenu, { type MenuItem } from "@/components/MyPageMenu";
import Tab from "@/components/Tab";
import InquiryTable from "@/components/buyer/InquiryTable";
import { menuItems } from "@/data/buyerMenuItems";
import { InquiryTabList } from "@/data/inquiryTabList";
import useIntersectionObserver from "@/hooks/useIntersection";
import { getAxiosInstance } from "@/lib/api/axiosInstance";
import cn from "@/proviers/toaster/utils/cn";
import { UserType } from "@/types/User";
import { InquiryList } from "@/types/inquiry";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

type TabValue = "all" | "wait" | "done";

export default function InquiryPage({
  type = "BUYER",
  menuItem = menuItems,
}: {
  type?: UserType;
  menuItem?: MenuItem[];
}) {
  const [selectedMenu, setSelectedMenu] = useState("inquiry");
  const [selectedTab, setSelectedTab] = useState<TabValue>("all");
  const router = useRouter();
  const axiosInstance = getAxiosInstance();

  const {
    data: inquiryResponse,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["inquiries", selectedTab],
    queryFn: async ({ pageParam = 1 }) => {
      const params: Record<string, string | number> = {
        page: pageParam,
        pageSize: 100,
      };

      // 탭에 따라 status 파라미터 추가
      if (selectedTab === "done") {
        params.status = "CompletedAnswer";
      } else if (selectedTab === "wait") {
        params.status = "WaitingAnswer";
      }

      const { data } = await axiosInstance.get<InquiryList>("/inquiries", { params });
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      // 현재 페이지의 list가 비어있지 않으면 다음 페이지가 있다고 판단
      return lastPage.list.length > 0 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  // 모든 페이지의 문의 목록을 하나의 배열로 합치기
  const inquiries = inquiryResponse?.pages.flatMap((page) => page.list) ?? [];

  const { setTarget } = useIntersectionObserver({
    threshold: 0.5,
    hasNextPage,
    fetchNextPage,
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex w-full max-w-[1520px] gap-10 pt-[3.75rem]">
        <MyPageMenu
          items={menuItem}
          selectedId={selectedMenu}
          onSelect={(id, path) => {
            setSelectedMenu(id);
            router.push(path);
          }}
          className={cn("h-[280px] w-[218px] flex-shrink-0", type === "SELLER" && "h-[337.5px]")}
        />
        <div className="flex w-full flex-col gap-5">
          {/* 탭 */}
          <div className="flex flex-col gap-5">
            <span className="text-black01 text-[1.75rem] font-extrabold">내 문의</span>
            <Tab
              tabs={InquiryTabList}
              value={selectedTab}
              onChange={(key) => setSelectedTab(key as TabValue)}
            />
          </div>
          {/* 테이블 */}
          {isLoading ? (
            <div className="flex justify-center py-8">로딩 중...</div>
          ) : inquiries.length === 0 ? (
            <div className="flex justify-center py-8">문의 내역이 없습니다.</div>
          ) : (
            <>
              <InquiryTable
                inquiries={inquiries}
                userType={type}
              />
              <div
                ref={setTarget}
                className="h-20 w-full"
              >
                {isFetchingNextPage && <div className="flex justify-center py-4">로딩 중...</div>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
