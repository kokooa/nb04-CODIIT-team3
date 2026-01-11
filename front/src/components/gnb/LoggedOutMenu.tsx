"use client";

import Link from "next/link";

export default function LoggedOutMenu() {
  return (
    <div className="flex gap-[50px]">
      <div className="flex items-center gap-3 py-[2px]">
        <Link
          href="/login"
          className="text-black02 px-[16.5px] py-[10px] text-sm"
        >
          로그인
        </Link>
        <Link
          href="/signup"
          className="text-black02 px-[10.5px] py-[10px] text-sm"
        >
          회원가입
        </Link>
      </div>
    </div>
  );
}
