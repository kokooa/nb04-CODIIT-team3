"use client";

import { useSearchOptionStore } from "@/stores/searchOptionStore";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SearchBar from "../input/SearchBar";
import LoggedInMenu from "./LoggedInMenu";
import LoggedOutMenu from "./LoggedOutMenu";
import Logo from "./Logo";

export default function GNB() {
  const [search, setSearch] = useState("");
  const { resetOption } = useSearchOptionStore();
  const { user } = useUserStore();
  const isLoggedIn = !!user;
  const router = useRouter();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      router.push(`/products?search=${search}`);
      resetOption();
      setSearch("");
    }
  };

  return (
    <nav className="fixed top-0 z-[51] w-full bg-white">
      <div className="mx-auto flex h-20 w-full max-w-[1920px] items-center justify-between px-[12.5rem] py-5">
        <div className="flex items-center gap-12">
          <Logo />
          <SearchBar
            placeholder="검색어 입력"
            value={search}
            onKeyDown={handleKeyDown}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
        </div>
        {isLoggedIn ? <LoggedInMenu user={user} /> : <LoggedOutMenu />}
      </div>
    </nav>
  );
}
