import Modal from "@/components/Modal";
import { getAxiosInstance } from "@/lib/api/axiosInstance";
import { inquiryEditForm, inquiryEditSchemas } from "@/lib/schemas/inquiryEdit.schema";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import { Inquiry, InquiryDetailAnswer } from "@/types/inquiry";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import React, { useState } from "react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import Button from "../button/Button";
import Divder from "../divider/Divder";
import BoxInput from "../input/BoxInput";
import TextArea from "../input/TextArea";

interface InquiryEditModalProps {
  open: boolean;
  inquiry: Inquiry | null;
  onClose: () => void;
}

interface EditInquiryRequest {
  title: string;
  content: string;
  isSecret: boolean;
}

export default function InquiryEditModal({ open, inquiry, onClose }: InquiryEditModalProps) {
  const axiosInstance = getAxiosInstance();
  const queryClient = useQueryClient();
  const toaster = useToaster();
  const { data: answer } = useQuery({
    queryKey: ["answer", inquiry?.id],
    queryFn: async () => {
      const response = await axiosInstance.get<InquiryDetailAnswer>(`/inquiries/${inquiry!.id}`);
      return response.data;
    },
    enabled: !!inquiry,
  });

  const editMutation = useMutation({
    mutationFn: async (data: EditInquiryRequest) => {
      const response = await axiosInstance.patch<InquiryDetailAnswer>(`/inquiries/${inquiry?.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["answer", inquiry?.id] });
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      toaster("info", "문의가 등록됐습니다.");
      onClose();
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<inquiryEditForm>({
    resolver: zodResolver(inquiryEditSchemas),
    defaultValues: {
      title: inquiry?.title ?? "",
      contents: answer?.content ?? "",
      isSecret: inquiry?.isSecret ?? false,
    },
  });
  const [hasError, setHasError] = useState(false);

  const isSecret = watch("isSecret");

  useEffect(() => {
    if (inquiry) {
      reset({
        title: inquiry.title,
        contents: answer?.content,
        isSecret: inquiry.isSecret,
      });
    }
  }, [inquiry, answer, reset]);

  const onSubmit = (data: inquiryEditForm) => {
    editMutation.mutate({
      title: data.title,
      content: data.contents,
      isSecret: data.isSecret,
    });
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
    >
      <div className="relative w-[600px] text-left">
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
        <div className="text-black01 mb-6 text-[1.75rem] font-extrabold">문의 수정</div>
        <Divder className="mt-5 mb-10" />
        <div className="mb-10 flex w-130 flex-col gap-5">
          <div className="flex items-center gap-5">
            <div className="relative h-20 w-20">
              <Image
                src={hasError ? "/images/Mask-group.svg" : (inquiry?.product.image ?? "/images/Mask-group.svg")}
                alt={inquiry?.product.name ?? "상품 이미지"}
                fill
                className="rounded-md object-cover"
                onError={() => setHasError(true)}
              />
            </div>
            <span className="text-black01 text-base font-normal">{inquiry?.product.name}</span>
          </div>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-2.5">
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <BoxInput
                  {...field}
                  id="title"
                  label="제목"
                  checkbox={true}
                  isSecret={isSecret}
                  placeholder="문의 제목을 입력해주세요"
                  onCheckboxChange={(e) => {
                    setValue("isSecret", e.target.checked);
                  }}
                />
              )}
            />
            {errors.title && <p className="text-red-500">{errors.title.message}</p>}
          </div>
          <div className="flex flex-col gap-2.5">
            <Controller
              name="contents"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  id="contents"
                  label="문의 내용"
                  placeholder="궁금한 내용을 입력해 주세요"
                />
              )}
            />
            {errors.contents && <p className="text-red-500">{errors.contents.message}</p>}
          </div>
          <Divder className="my-5" />
          <div className="flex justify-end gap-2.5">
            <Button
              label="취소"
              size="medium"
              variant="secondary"
              color="white"
              className="h-16.25 w-full"
              onClick={onClose}
              disabled={editMutation.isPending}
            />
            <Button
              label={editMutation.isPending ? "수정 중..." : "수정"}
              size="medium"
              variant="primary"
              color="black"
              className="h-16.25 w-full"
              type="submit"
              disabled={editMutation.isPending}
            />
          </div>
        </form>
      </div>
    </Modal>
  );
}
