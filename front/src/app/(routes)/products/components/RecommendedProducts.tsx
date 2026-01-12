"use client";

import { getProducts } from "@/lib/api/products";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import ProductItem from "./ProductItem";

const ITEMS_PER_PAGE = 4;

const RecommendedProducts = () => {
  const { data } = useQuery({
    queryKey: ["RecommendedProducts"],
    queryFn: () => getProducts({ page: 1, pageSize: ITEMS_PER_PAGE, sort: "salesRanking" }),
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <h2 className="text-black01 mb-10 text-[1.75rem] leading-none font-extrabold">추천 상품</h2>
      <div className="grid w-full grid-cols-4 gap-5">
        {data?.list.map((product) => (
          <ProductItem
            key={product.id}
            product={product}
            store
          />
        ))}
      </div>
    </>
  );
};

export default RecommendedProducts;
