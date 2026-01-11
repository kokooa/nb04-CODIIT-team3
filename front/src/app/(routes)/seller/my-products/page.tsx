"use client";

import MyPageMenu from "@/components/MyPageMenu";
import Button from "@/components/button/Button";
import { menuItems } from "@/data/sellerMenuItems";
import { getMyStore } from "@/lib/api/store";
import { StoreDetailResponse } from "@/types/store";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ProductTable from "./components/ProductTable";

export default function MyProductsPage() {
  const [selectedMenu, setSelectedMenu] = useState("myproducts");
  const router = useRouter();

  // 스토어 없을 시 처리
  const {
    data: store,
    isLoading,
    error,
  } = useQuery<StoreDetailResponse | null, unknown>({
    queryKey: ["myStore"],
    queryFn: getMyStore,
    retry: false,
  });

  return (
    <div className="mx-auto mb-37 flex w-[1520px] gap-10 pt-[3.625rem]">
      {/* 왼쪽 메뉴, 오른쪽 상품 목록 */}
      <MyPageMenu
        items={menuItems}
        selectedId={selectedMenu}
        onSelect={(id, path) => {
          setSelectedMenu(id);
          router.push(path);
        }}
        className="mt-[2.75rem] h-[337.5px] w-[218px]"
      />
      <div className="flex w-[1262px] flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">상품 목록</div>
          {store && (
            <Button
              label="상품 등록"
              size="medium"
              variant="primary"
              className="h-[50px] w-[140px] text-[18px]"
              onClick={() => router.push("/seller/my-products/create")}
            />
          )}
        </div>
        {isLoading ? (
          <div className="px-6 py-10">스토어 정보를 불러오는 중...</div>
        ) : (axios.isAxiosError(error) && error.response?.status === 404) || store === null ? (
          <div className="px-6 py-10 text-red-500">아직 스토어가 생성되지 않았습니다.</div>
        ) : (
          <ProductTable />
        )}
      </div>
    </div>
  );
}
