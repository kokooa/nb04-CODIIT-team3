"use client";

import MyPageMenu from "@/components/MyPageMenu";
import { menuItems } from "@/data/sellerMenuItems";
import { getMyStore } from "@/lib/api/store";
import { StoreDetailResponse } from "@/types/store";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import StoreDashboard from "./components/StoreDashboard";
import StoreEmptyState from "./components/StoreEmptyState";

export default function StorePage() {
  const [selectedMenu, setSelectedMenu] = useState("mystore");
  const router = useRouter();

  const { data: store, isLoading } = useQuery<StoreDetailResponse | null>({
    queryKey: ["myStore"],
    queryFn: getMyStore,
    retry: false,
  });

  if (isLoading) {
    return <div className="py-20 text-center">스토어 정보를 불러오는 중입니다...</div>;
  }

  return (
    <div className="mx-auto flex w-[1520px] gap-10 pt-[3.625rem]">
      {/* 왼쪽 메뉴, 오른쪽 내스토어 */}
      <MyPageMenu
        items={menuItems}
        selectedId={selectedMenu}
        onSelect={(id, path) => {
          setSelectedMenu(id);
          router.push(path);
        }}
        className="h-[337.5px] w-[218px]"
      />
      <div className="flex w-full flex-col gap-10">
        <div className="text-2xl font-bold">내 스토어</div>
        {store ? <StoreDashboard store={store} /> : <StoreEmptyState />}
      </div>
    </div>
  );
}
