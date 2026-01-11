"use client";

import formatDate from "@/lib/functions/dateFormat";
import { useUserStore } from "@/stores/userStore";
import { InquiryData } from "@/types/inquiry";
import { useState } from "react";

interface InquiryProps {
  inquiry: InquiryData;
}

const Inquiry = ({ inquiry }: InquiryProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { user } = useUserStore();

  const handleToggle = () => {
    if (inquiry.isSecret && inquiry.userId !== user?.id) return;
    setIsOpen((prev) => !prev);
  };

  return (
    <div
      className={`border-gray04 text-black02 flex cursor-pointer border-b py-7.5 text-center text-lg leading-none ${isOpen && inquiry.status && "bg-gray05"}`}
      onClick={handleToggle}
    >
      <p className="w-1/5">{inquiry.user?.name}</p>
      <p className="w-1/10">{formatDate(inquiry.createdAt)}</p>

      {isOpen ? (
        <div className="w-1/2 space-y-10 pl-25 text-left text-base leading-relaxed">
          <div className="flex gap-5">
            <div className="text-[1.75rem] leading-none font-extrabold">Q.</div>
            <div className="space-y-3">
              <p className="font-bold">{inquiry.title}</p>
              <p className="">{inquiry.content}</p>
            </div>
          </div>
          {inquiry.status === "CompletedAnswer" && (
            <div className="flex gap-5">
              <div className="text-[1.75rem] leading-none font-extrabold">A.</div>
              <p>
                {inquiry.reply?.content.split("\n").map((line, index) => (
                  <span key={index}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
            </div>
          )}
        </div>
      ) : inquiry.isSecret ? (
        <p className="text-gray01 w-1/2 pl-25 text-left">비밀글입니다.</p>
      ) : (
        <p className="w-1/2 pl-25 text-left">{inquiry.title}</p>
      )}

      <p className="w-1/5">{inquiry.status === "WaitingAnswer" ? "대기 중" : "답변완료"}</p>
    </div>
  );
};

export default Inquiry;
