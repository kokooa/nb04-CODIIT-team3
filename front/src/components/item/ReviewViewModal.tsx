import Stars from "@/app/(routes)/products/[productId]/components/Stars";
import Modal from "@/components/Modal";
import { getAxiosInstance } from "@/lib/api/axiosInstance";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import { OrderItemResponse } from "@/types/order";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Button from "../button/Button";
import Divder from "../divider/Divder";

interface ReviewViewModalProps {
  open: boolean;
  onClose: () => void;
  purchase: OrderItemResponse | null;
}

export default function ReviewViewModal({ open, onClose, purchase }: ReviewViewModalProps) {
  const axiosInstance = getAxiosInstance();
  const queryClient = useQueryClient();
  const toaster = useToaster();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!purchase?.product.reviews[0]) return;
      await axiosInstance.delete(`/review/${purchase.product.reviews[0].id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mypage-orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toaster("info", "리뷰가 삭제됐습니다.");
      onClose();
    },
  });

  if (!purchase) return null;

  // 리뷰가 있는 경우 첫 번째 리뷰 사용
  const review = purchase.product.reviews[0];

  const handleDelete = () => {
    console.log(purchase.product.reviews[0].id);
    deleteMutation.mutate();
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
    >
      <div className="relative w-[600px]">
        <button
          className="absolute top-0 right-0"
          onClick={onClose}
        >
          <Image
            src="/icon/deleteBlack.svg"
            alt="닫기"
            width={24}
            height={24}
          />
        </button>
        <div className="text-black01 mb-5 text-[1.75rem] font-extrabold">작성한 리뷰</div>
        <Divder className="mb-10" />
        <div className="mb-10 flex flex-col gap-6">
          <div className="flex gap-2.5">
            <div className="relative h-[6.875rem] w-25">
              <Image
                src={purchase.product.image ?? "/images/Mask-group.svg"}
                fill
                alt="CODI-IT"
                className="rounded-md object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col gap-2.5">
              <div className="flex flex-col gap-[0.625rem]">
                <div className="text-gray01 text-base/5 font-normal">구매일 : {new Date().toLocaleDateString()}</div>
                <div className="text-black01 text-lg/5 font-bold">{purchase.product.name}</div>
              </div>
              <div className="text-black01 text-lg/5 font-normal">사이즈 : {purchase.size.size.ko}</div>
              <div className="flex items-center gap-[0.625rem]">
                <span className="text-lg/5 font-extrabold">{purchase.price.toLocaleString()}원</span>
                <span className="text-gray01 text-base/4.5 font-normal">| {purchase.quantity}개</span>
              </div>
            </div>
          </div>

          {review && (
            <div className="flex flex-col gap-4">
              <Stars
                size="normal"
                rating={review.rating}
              />
              <div className="flex items-center gap-1">
                <span className="text-black01 text-base/4.5 font-bold">구매자</span>
                <span className="text-gray01 text-base/4.5 font-normal">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-black01 text-lg font-normal">{review.content}</p>
            </div>
          )}
        </div>
        <Button
          label="리뷰 삭제"
          size="large"
          variant="secondary"
          color="white"
          className="h-15 w-full"
          onClick={handleDelete}
        />
      </div>
    </Modal>
  );
}
