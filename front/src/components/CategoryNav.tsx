"use client";

import { useSearchOptionStore } from "@/stores/searchOptionStore";
import { useRouter } from "next/navigation";

const categories = ["top", "bottom", "dress", "outer", "skirt", "shoes", "acc"];

export const CategoryNav = () => {
  const { searchOption, updateOption, resetOption } = useSearchOptionStore();
  const router = useRouter();

  const onClickNav = (label: string) => {
    resetOption();
    router.push("/products#content");
    updateOption("categoryName", label);
  };

  return (
    <nav className="border-gray04 fixed z-50 w-full border-b bg-white">
      <div className="flex justify-center">
        <ul className="flex items-center justify-center">
          {categories.map((label) => (
            <li
              key={label}
              className={`w-[210px] py-4 text-center ${searchOption.categoryName === label ? "bg-gray04" : null}`}
            >
              <span
                onClick={() => onClickNav(label)}
                className="text-black01 cursor-pointer text-[16px] font-extrabold uppercase"
              >
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};
