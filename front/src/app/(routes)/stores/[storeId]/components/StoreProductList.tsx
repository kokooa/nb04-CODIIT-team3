"use client";

import ProductItem from "@/app/(routes)/products/components/ProductItem";
import ProductSort from "@/app/(routes)/products/components/ProductSort";
import PageButton from "@/components/button/PageButton";
import SearchBar from "@/components/input/SearchBar";
import { getProducts } from "@/lib/api/products";
import useDebounce from "@/lib/functions/useDebounce";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, useState } from "react";

const ITEMS_PER_PAGE = 12;

interface StoreProductListProps {
  storeId: string;
}

const StoreProductList = ({ storeId }: StoreProductListProps) => {
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [sorted, setSorted] = useState("mostReviewed"); // 정렬 옵션
  const [searchText, setSearchText] = useState("");

  const debouncedSearchText = useDebounce(searchText, 500);

  const { data } = useQuery({
    queryKey: ["StoreProducts", storeId, currentPage, sorted, debouncedSearchText],
    queryFn: () =>
      getProducts({
        page: currentPage,
        pageSize: ITEMS_PER_PAGE,
        sort: sorted,
        search: debouncedSearchText,
        favoriteStore: storeId,
      }),
  });

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  return (
    <div>
      <p className="text-black01 text-base leading-none font-bold">총 {data?.totalCount ?? 0}개 상품</p>
      <div className="mt-7.5 flex items-center justify-between">
        <ProductSort
          sorted={sorted}
          onClick={setSorted}
        />
        <SearchBar
          placeholder={`스토어 내 검색`}
          value={searchText}
          onChange={onChange}
        />
      </div>
      <div className="mt-15 mb-20 grid grid-cols-4 gap-x-5 gap-y-15">
        {data?.list.map((product) => (
          <ProductItem
            key={product.id}
            product={product}
          />
        ))}
      </div>
      <PageButton
        total={data?.totalCount}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        itemsPerPage={ITEMS_PER_PAGE}
      />
    </div>
  );
};

export default StoreProductList;
