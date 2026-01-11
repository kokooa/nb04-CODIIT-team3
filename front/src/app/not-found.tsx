"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const NotFound = () => {
  const router = useRouter();

  return (
    <div className="flex h-[90dvh] flex-col items-center justify-center">
      <h2 className="mb-6 text-[7.5rem] leading-none font-extrabold">404 </h2>
      <p className="text-gray01 mb-5 text-lg leading-none font-bold">찾을 수 없는 페이지 입니다.</p>
      <p className="text-gray02 mb-10 text-sm leading-none">
        요청하신 페이지가 사라졌거나, 잘못된 경로를 이용하셨어요.
      </p>
      <div className="flex gap-4">
        <button
          className="bg-black01 flex h-16 w-60 items-center justify-center rounded-xl text-lg font-bold text-white"
          onClick={() => router.back()}
        >
          뒤로 가기
        </button>
        <Link
          href="/"
          className="text-black01 border-black01 flex h-16 w-60 items-center justify-center rounded-xl border bg-white text-lg font-bold"
        >
          홈으로 가기
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
