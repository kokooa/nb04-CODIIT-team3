import Stars from "@/app/(routes)/products/[productId]/components/Stars";
import Modal from "@/components/Modal";
import { getAxiosInstance } from "@/lib/api/axiosInstance";
import { ReviewCreateForm, reviewCreateSchemas } from "@/lib/schemas/reviewCreate.schemas";
import { OrderItemResponse } from "@/types/order";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import Button from "../button/Button";
import Divder from "../divider/Divder";
import TextArea from "../input/TextArea";

interface ReviewWriteModalProps {
  open: boolean;
  onClose: () => void;
  purchase: OrderItemResponse | null;
  onSubmit: () => void;
}

export default function ReviewWriteModal({ open, onClose, purchase, onSubmit }: ReviewWriteModalProps) {
  const axiosInstance = getAxiosInstance();
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReviewCreateForm>({
    resolver: zodResolver(reviewCreateSchemas),
    defaultValues: { rating: 0, content: "" },
  });

  useEffect(() => {
    if (open) reset({ rating: 0, content: "" });
  }, [open, reset]);

  // 리뷰 생성 mutation
  const createReviewMutation = useMutation({
    mutationFn: async (data: ReviewCreateForm) => {
      if (!purchase) throw new Error("구매 정보가 없습니다.");

      return await axiosInstance.post(`/product/${purchase.productId}/reviews`, {
        orderItemId: purchase.id,
        rating: data.rating,
        content: data.content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mypage-orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      onSubmit();
      onClose();
    },
    onError: (error) => {
      console.error("리뷰 작성 실패:", error);
    },
  });

  const handleReviewSubmit = (data: ReviewCreateForm) => {
    createReviewMutation.mutate(data);
  };

  if (!purchase) return null;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
    >
      <form
        onSubmit={handleSubmit(handleReviewSubmit)}
        className="relative w-[600px]"
      >
        <button
          type="button"
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
        <div className="text-black01 mb-5 text-[1.75rem] font-extrabold">리뷰 쓰기</div>
        <Divder className="mb-10" />
        <div className="mb-10 flex flex-col gap-6">
          <div className="flex gap-2.5">
            <div className="relative h-[6.875rem] w-25">
              <Image
                src={purchase.product.image ?? "/images/Mask-group.svg"}
                fill
                alt={purchase.product.name}
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
          <div className="flex flex-col gap-5">
            <label className="text-black01 text-xl font-extrabold">상품은 만족하셨나요?</label>
            <Controller
              name="rating"
              control={control}
              render={({ field: { value, onChange } }) => (
                <div className="flex items-center justify-center gap-1">
                  <Stars
                    size="XLarge"
                    rating={value}
                    onChange={onChange}
                  />
                  {errors.rating && <span className="text-red01 text-sm">{errors.rating.message}</span>}
                </div>
              )}
            />
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-2.5">
                  <TextArea
                    {...field}
                    label="어떤 점이 좋았나요?"
                    placeholder="최소 10자 이상 입력"
                  />
                  {errors.content && <span className="text-red01 text-sm">{errors.content.message}</span>}
                </div>
              )}
            />
          </div>
        </div>
        <Button
          type="submit"
          label="리뷰 등록"
          size="large"
          variant="primary"
          color="black"
          className="h-15 w-full"
          disabled={createReviewMutation.isPending}
        />
      </form>
    </Modal>
  );
}
