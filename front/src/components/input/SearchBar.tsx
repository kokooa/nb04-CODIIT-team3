"use client";

import Image from "next/image";
import React, { InputHTMLAttributes } from "react";

const SearchBar = ({ ...props }: InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <label className="relative w-[18.75rem]">
      <input
        className="border-gray03 placeholder:text-gray02 h-10 w-full rounded-md border bg-white pl-5 text-sm focus-visible:outline-1"
        {...props}
      />
      <Image
        className="absolute top-2.5 right-5"
        src="/icon/search.svg"
        width={20}
        height={20}
        alt="아이콘"
      />
    </label>
  );
};

export default SearchBar;
