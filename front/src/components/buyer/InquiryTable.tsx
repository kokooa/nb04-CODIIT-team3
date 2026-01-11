import cn from "@/proviers/toaster/utils/cn";
import { UserType } from "@/types/User";
import { Inquiry } from "@/types/inquiry";
import Image from "next/image";
import { useState } from "react";
import React from "react";
import InquiryAnswerModal from "../seller/InquiryAnswerModal";
import InquiryDeleteModal from "./InquiryDeleteModal";
import InquiryDetail from "./InquiryDetail";
import InquiryEditModal from "./InquiryEditModal";

interface InquiryTableProps {
  inquiries: Inquiry[];
  userType?: UserType;
}

export default function InquiryTable({ inquiries, userType }: InquiryTableProps) {
  const [editTargetId, setEditTargetId] = useState<Inquiry | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<Inquiry | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});
  const [sellerModalType, setSellerModalType] = useState<"CompletedAnswer" | "WaitingAnswer">("WaitingAnswer");

  const handleImageError = (imageUrl: string) => {
    setImageErrorMap((prev) => ({ ...prev, [imageUrl]: true }));
  };

  const handleCloseEdit = () => setEditTargetId(null);
  const handleCloseDelete = () => setDeleteTargetId(null);

  const handleRowClick = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const getStatusText = (status: Inquiry["status"]) => {
    switch (status) {
      case "CompletedAnswer":
        return "답변 완료";
      case "WaitingAnswer":
        return "대기 중";
      default:
        return status;
    }
  };
  return (
    <div className="border-black01 w-full border-t">
      <div className="text-black01 border-gray03 flex gap-20 border-b py-5 text-base font-bold">
        <div className="flex-1 text-center">상품명</div>
        <div className="w-25 text-start">작성일</div>
        <div className="flex-1 text-start">문의 제목</div>
        <div className="w-[100px] text-start">답변상태</div>
        <div className={cn("w-[128px]", userType === "SELLER" && "w-[157px]")}></div>
      </div>
      {inquiries.map((item, i) => (
        <div
          key={`${item.id} ${i}`}
          onClick={() => handleRowClick(item.id)}
          className="border-gray04 relative flex w-full cursor-pointer flex-col items-center gap-5 border-b py-3"
        >
          <div className="flex w-full items-center gap-20">
            <div className="flex flex-1 items-center gap-5">
              <div className="relative h-16 w-16 flex-shrink-0">
                <Image
                  src={imageErrorMap[item.product.image] ? "/images/Mask-group.svg" : item.product.image}
                  alt={item.product.name}
                  fill
                  className="rounded-xl object-cover"
                  onError={() => handleImageError(item.product.image)}
                />
              </div>
              <span className="text-black01 text-base font-normal">{item.product.name}</span>
            </div>
            <div className="text-black01 w-25 flex-shrink-0 text-base font-normal">
              {new Date(item.createdAt).toISOString().split("T")[0]}
            </div>
            <div className="flex flex-1 items-center gap-1 text-start">
              {item.isSecret && (
                <Image
                  src="/icon/icon_lock.svg"
                  alt="lock"
                  width={24}
                  height={24}
                />
              )}
              <span className="text-black01 truncate text-base font-normal">{item.title}</span>
            </div>
            <div className="text-black01 w-[100px] text-start text-base font-normal">{getStatusText(item.status)}</div>
            <div className={cn("flex w-[128px] gap-4", userType === "SELLER" && "w-[157px]")}>
              {item.status === "WaitingAnswer" && (
                <button
                  className={
                    "border-gray03 text-black01 hover:bg-black01 active:bg-black01 rounded-sm border px-3 py-[0.4375rem] text-base/4.5 font-bold transition-all duration-300 hover:text-white active:text-white"
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditTargetId(item);
                    setSellerModalType(item.status);
                  }}
                >
                  {userType === "SELLER" ? "답변하기" : "수정"}
                </button>
              )}
              {item.status === "CompletedAnswer" && userType === "SELLER" && (
                <button
                  className={
                    "border-gray03 text-black01 hover:bg-black01 active:bg-black01 rounded-sm border px-3 py-[0.4375rem] text-base/4.5 font-bold transition-all duration-300 hover:text-white active:text-white"
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditTargetId(item);
                    setSellerModalType(item.status);
                  }}
                >
                  수정하기
                </button>
              )}
              <button
                className="border-gray03 text-black01 hover:bg-black01 active:bg-black01 rounded-sm border px-3 py-[0.4375rem] text-base/4.5 font-bold transition-all duration-300 hover:text-white active:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTargetId(item);
                }}
              >
                삭제
              </button>
            </div>
          </div>
          {selectedId === item.id && <InquiryDetail inquiry={item} />}
        </div>
      ))}
      {userType === "SELLER" ? (
        <InquiryAnswerModal
          type={sellerModalType}
          open={!!editTargetId}
          inquiry={editTargetId}
          onClose={handleCloseEdit}
        />
      ) : (
        <InquiryEditModal
          open={!!editTargetId}
          inquiry={editTargetId}
          onClose={handleCloseEdit}
        />
      )}
      <InquiryDeleteModal
        open={!!deleteTargetId}
        inquiry={deleteTargetId}
        onClose={handleCloseDelete}
      />
    </div>
  );
}
