"use client";

import { getAxiosInstance } from "@/lib/api/axiosInstance";
import { User } from "@/types/User";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
import BuyerLevelModal from "../buyer/BuyerLevelModal";

export default function MypageHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const axiosInstance = getAxiosInstance();

  const { data: user } = useQuery({
    queryKey: ["User"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<User>("/users/me");
      return data;
    },
  });

  const handleClick = () => {
    setIsOpen((prev) => !prev);
  };

  if (!user) return null;

  return (
    <div className="border-black01 flex w-full flex-col items-center justify-center gap-7.5 border-b px-[1.875rem] pt-[1.875rem] pb-10">
      <Image
        src={user.image}
        alt={user.name}
        width={100}
        height={100}
        className="max-h-[100px] max-w-[100px] rounded-full"
      />
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-[0.8125rem]">
          <div className="flex items-center gap-1">
            <span className="text-black01 text-2xl font-bold">{user.name}</span>
          </div>
          <span className="text-black01 text-sm font-bold">{user.type === "BUYER" ? "바이어" : "셀러"}</span>
        </div>
        <div className="relative flex gap-2.5">
          <div
            onClick={handleClick}
            className="text-black01 cursor-pointer text-lg font-extrabold underline"
          >
            {user.grade?.name}
          </div>
          <span className="text-black01 text-lg font-normal">| 포인트 {user.points.toLocaleString()}</span>
          <BuyerLevelModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            grade={user.grade}
          />
        </div>
      </div>
    </div>
  );
}
