"use client";

import PageButton from "@/components/button/PageButton";
import { getProducts } from "@/lib/api/products";
import { useSearchOptionStore } from "@/stores/searchOptionStore";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import ProductItem from "./ProductItem";
import ProductSort from "./ProductSort";

const ITEMS_PER_PAGE = 16;

const ProductList = () => {
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [sorted, setSorted] = useState("highRating"); // 정렬 옵션
  const { searchOption } = useSearchOptionStore();
  const params = useSearchParams();
  const search = params.get("search");

  const searchToUse = search ? search : "";

  const { data } = useQuery({
    queryKey: ["products", { page: currentPage, sort: sorted, ...searchOption, search: searchToUse }],
    queryFn: () =>
      getProducts({
        page: currentPage,
        pageSize: ITEMS_PER_PAGE,
        sort: sorted,
        ...searchOption,
        search: searchToUse,
      }),
    placeholderData: keepPreviousData,
  });

  const onSorted = (sort: string) => {
    setSorted(sort);
    setCurrentPage(1);
  };

  return (
    <>
      <ProductSort
        sorted={sorted}
        onClick={onSorted}
      />
      <div className="mt-15 mb-20 grid grid-cols-4 gap-x-5 gap-y-15">
        {data?.list.map((product) => (
          <ProductItem
            key={product.id}
            product={product}
            store
          />
        ))}
      </div>
      <PageButton
        total={data?.totalCount}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        itemsPerPage={ITEMS_PER_PAGE}
      />
    </>
  );
};

export default ProductList;
