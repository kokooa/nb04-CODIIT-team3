"use client";

import SearchBar from "@/components/input/SearchBar";
import { getFavoriteStore } from "@/lib/api/userProfile";
import { useSearchOptionStore } from "@/stores/searchOptionStore";
import { useUserStore } from "@/stores/userStore";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

const TITLE = ["가격", "사이즈", "검색", "관심 스토어"];

const PRICE = [
  { min: 0, max: 20000 },
  { min: 20000, max: 50000 },
  { min: 50000, max: 100000 },
  { min: 100000, max: 200000 },
  { min: 200000, max: 0 },
];

const SIZE = ["Free", "XS", "S", "M", "L", "XL"];

const SearchProduct = () => {
  const { searchOption, updateOption } = useSearchOptionStore();
  const [localSearch, setLocalSearch] = useState("");
  const { user } = useUserStore();
  const router = useRouter();

  const { data: favoriteData } = useQuery({
    queryKey: ["favoriteStores"],
    queryFn: getFavoriteStore,
    enabled: !!user, // user가 있을 때만 실행
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      router.push(`/products?search=${localSearch}`);
      setLocalSearch("");
    }
  };

  return (
    <div className="flex">
      <div className="w-40 space-y-5">
        {TITLE.map((title) => (
          <p
            className="text-black01 flex h-10 items-center text-lg leading-none font-extrabold"
            key={title}
          >
            {title}
          </p>
        ))}
      </div>
      <div className="space-y-5">
        <div className="flex h-10 items-center gap-15">
          {PRICE.map((price) => (
            <button
              className={`text-black01 text-lg ${searchOption.priceMin === price.min && searchOption.priceMax === price.max && "font-extrabold"}`}
              key={price.max}
              onClick={() => {
                updateOption("priceMin", price.min);
                updateOption("priceMax", price.max);
              }}
            >
              {price.min !== 0 && price.min.toLocaleString()}
              {price.min !== 0 && "원"} ~ {price.max !== 0 && price.max.toLocaleString()}
              {price.max !== 0 && "원"}
            </button>
          ))}
        </div>
        <div className="flex h-10 items-center gap-15">
          {SIZE.map((size) => (
            <button
              className={`text-black01 text-lg ${searchOption.size === size && "font-extrabold"}`}
              key={size}
              onClick={() => updateOption("size", size)}
            >
              {size}
            </button>
          ))}
        </div>
        <div className="flex h-10 items-center gap-15">
          <SearchBar
            placeholder="검색어 입력"
            value={localSearch}
            onKeyDown={handleKeyDown}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>
        <div className="ju flex h-10 items-center gap-15">
          {favoriteData?.map((store) => (
            <button
              className={`text-black01 text-lg ${searchOption.favoriteStore === store.store.id && "font-extrabold"}`}
              key={store.store.id}
              onClick={() => updateOption("favoriteStore", store.store.id)}
            >
              {store.store.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchProduct;
