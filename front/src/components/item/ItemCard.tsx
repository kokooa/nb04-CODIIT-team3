import { OrderItemResponse } from "@/types/order";
import Image from "next/image";
import { useState } from "react";
import Button from "../button/Button";
import ReviewViewModal from "./ReviewViewModal";
import ReviewWriteModal from "./ReviewWriteModal";

interface ItemCardProps {
  purchases: OrderItemResponse[];
}

export default function ItemCard({ purchases }: ItemCardProps) {
  const [reviewViewTarget, setReviewViewTarget] = useState<OrderItemResponse | null>(null);
  const [reviewWriteTarget, setReviewWriteTarget] = useState<OrderItemResponse | null>(null);

  const handleCloseView = () => setReviewViewTarget(null);
  const handleCloseWrite = () => setReviewWriteTarget(null);

  const handleReviewSubmit = () => {
    handleCloseWrite();
  };

  return (
    <div className="flex w-full flex-col gap-5">
      {purchases.map((item) => (
        <div
          key={item.id}
          className="border-gray03 flex items-end justify-between rounded-2xl border bg-white p-[1.875rem]"
        >
          <div className="flex items-center gap-[1.875rem]">
            <div className="relative h-45 w-45">
              <Image
                src={item.product.image ?? "/images/Mask-group.svg"}
                alt={item.product.name}
                fill
                className="rounded-xl object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col gap-[1.875rem]">
              <div className="flex flex-col gap-[0.625rem]">
                <div className="text-gray01 text-base font-normal">구매일 : {new Date().toLocaleDateString()}</div>
                <div className="text-black01 text-lg font-bold">{item.product.name}</div>
              </div>
              <div className="text-black01 text-lg font-normal">사이즈 : {item.size.size.ko}</div>
              <div className="flex items-center gap-[0.625rem]">
                <span className="text-lg font-extrabold">{item.price.toLocaleString()}원</span>
                <span className="text-gray01 text-base font-normal">| {item.quantity}개</span>
              </div>
            </div>
          </div>
          <Button
            label={item.isReviewed ? "리뷰 보기" : "리뷰 쓰기"}
            size="medium"
            variant="secondary"
            color={item.isReviewed ? "white" : "black"}
            className="h-[3.75rem] w-[12.5rem] px-[1.875rem] py-[0.875rem] font-bold"
            onClick={() => {
              if (item.isReviewed) setReviewViewTarget(item);
              else setReviewWriteTarget(item);
            }}
          />
        </div>
      ))}

      {/* 리뷰 보기 모달 */}
      <ReviewViewModal
        open={!!reviewViewTarget}
        onClose={handleCloseView}
        purchase={reviewViewTarget}
      />

      {/* 리뷰 작성 모달 */}
      <ReviewWriteModal
        open={!!reviewWriteTarget}
        onClose={handleCloseWrite}
        purchase={reviewWriteTarget}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
}
