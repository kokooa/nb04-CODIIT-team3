"use client";

import Link from "next/link";

interface ErrorProps {
  error: Error;
  reset: () => void;
}

const Error = ({ error, reset }: ErrorProps) => {
  return (
    <div className="flex h-[90dvh] flex-col items-center justify-center">
      <h2 className="mb-6 text-[7.5rem] leading-none font-extrabold">500</h2>
      <p className="text-gray02 mb-10 text-sm leading-none">{error.message}</p>
      <div className="flex gap-4">
        <button
          className="bg-black01 flex h-16 w-60 items-center justify-center rounded-xl text-lg font-bold text-white"
          onClick={() => reset()}
        >
          새로고침
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

export default Error;
