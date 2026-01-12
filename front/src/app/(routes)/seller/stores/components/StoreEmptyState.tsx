"use client";

import Button from "@/components/button/Button";
import { useState } from "react";
import StoreCreateModal from "./StoreCreateModal";

export default function StoreEmptyState() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  return (
    <div className="border-gray03 flex h-[240px] items-center justify-center rounded-2xl border bg-white py-15">
      <div className="flex flex-col gap-10">
        <p className="text-gray01 text-center">내 스토어를 등록해 보세요</p>
        <Button
          label="등록하기"
          size="medium"
          variant="primary"
          className="h-[60px] w-[400px]"
          onClick={() => setIsCreateModalOpen(true)}
        />
      </div>
      {isCreateModalOpen && <StoreCreateModal onClose={() => setIsCreateModalOpen(false)} />}
    </div>
  );
}
