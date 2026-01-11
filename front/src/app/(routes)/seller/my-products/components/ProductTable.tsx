"use client";

import PageButton from "@/components/button/PageButton";
import Divder from "@/components/divider/Divder";
import { getMyProduct } from "@/lib/api/store";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import ProductItem from "./ProductItem";

export default function ProductTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["myProducts", currentPage],
    queryFn: () => getMyProduct(currentPage, pageSize),
    retry: false,
  });

  if (isLoading) return <div className="px-6 py-10">상품을 불러오는 중...</div>;
  if (isError) return <div className="px-6 py-10 text-red-500">상품을 불러오는 데 실패했습니다.</div>;

  return (
    <>
      <div className="mb-10">
        <div className="border-black01 text-black01 flex w-full items-center gap-14 border-t px-6 py-5 text-center text-base leading-none font-bold">
          <div className="w-[33px] text-center">수정</div>
          <div className="w-[80px] text-center">상품 이미지</div>
          <div className="w-[240px] text-center">상품명</div>
          <div className="w-[75px] text-center">판매가</div>
          <div className="w-[60px] text-center">재고수량</div>
          <div className="w-[169px] text-center">품절 여부(옵션 일부 포함)</div>
          <div className="w-[63px] text-center">할인 여부</div>
          <div className="w-[102px] text-center">상품 등록일</div>
        </div>
        <Divder />
        {data?.list.map((product) => (
          <ProductItem
            key={product.id}
            product={{
              id: product.id,
              imageUrl: product.image,
              name: product.name,
              price: product.price,
              stock: product.stock,
              isDiscounted: product.isDiscount,
              isSoldout: product.stock === 0,
              createdAt: product.createdAt,
            }}
          />
        ))}
      </div>
      <PageButton
        total={data?.totalCount}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        itemsPerPage={10}
      />
    </>
  );
}
