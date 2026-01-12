import Image from "next/image";
import { useState } from "react";
import StoreEditModal from "./StoreEditModal";

export interface StoreInfoProps {
  store: {
    id: string;
    name: string;
    address: string;
    detailAddress?: string;
    phoneNumber: string;
    favoriteCount: number;
    content: string;
    image: string;
  };
}

export function StoreInfo({ store }: StoreInfoProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <section className="flex w-full flex-col gap-10">
      <div className="flex justify-between gap-10">
        <div>
          <div className="flex items-center gap-[0.8125rem]">
            <p className="text-black01 text-[24px] font-bold">{store.name}</p>
            <button
              type="button"
              className="text-gray01 cursor-pointer text-lg underline"
              aria-label="스토어 정보 수정"
              onClick={() => setIsEditModalOpen(true)}
            >
              수정
            </button>
          </div>
          <div className="mt-5 flex items-center gap-[2.375rem]">
            <span className="text-gray01 text-base font-bold">주소</span>
            <span className="text-black02 text-base">
              {store.address} {store.detailAddress ?? ""}
            </span>
          </div>
          <div className="mt-[0.875rem] flex items-center gap-6">
            <span className="text-gray01 text-base font-bold">연락처</span>
            <span className="text-black02 text-base">{store.phoneNumber}</span>
          </div>
        </div>
        <div className="flex flex-col gap-[0.375rem] px-[1.625rem] py-[0.7188rem]">
          <Image
            src="/icon/heart.svg"
            alt=""
            width={50}
            height={50}
          />
          <span className="text-black02 text-center">{store.favoriteCount}</span>
        </div>
      </div>
      <div className="w-full bg-[#f8f8f8] p-10 text-left whitespace-pre-line">{store.content}</div>
      {isEditModalOpen && (
        <StoreEditModal
          onClose={() => setIsEditModalOpen(false)}
          store={{
            id: store.id,
            name: store.name,
            address: store.address,
            detailAddress: store.detailAddress,
            phone: store.phoneNumber,
            content: store.content,
            imageUrl: store.image,
          }}
        />
      )}
    </section>
  );
}
