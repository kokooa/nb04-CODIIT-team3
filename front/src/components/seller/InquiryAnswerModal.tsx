import Modal from "@/components/Modal";
import { getAxiosInstance } from "@/lib/api/axiosInstance";
import { inquiryReply, inquiryReplyForm } from "@/lib/schemas/inquiryReply";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import { Inquiry, InquiryDetailAnswer, InquiryReply } from "@/types/inquiry";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import React, { useState } from "react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import Button from "../button/Button";
import Divder from "../divider/Divder";
import TextArea from "../input/TextArea";

interface InquiryEditModalProps {
  open: boolean;
  inquiry: Inquiry | null;
  type: "CompletedAnswer" | "WaitingAnswer";
  onClose: () => void;
}
interface InquiryReplyRequest {
  content: string;
}
type StatusTypeCheckValueType = string;

const axiosInstance = getAxiosInstance();
const responseAnswer = async (id: string) => {
  try {
    const res = await axiosInstance.get(`/inquiries/${id}`);
    return res;
  } catch (error) {
    console.error("inquiry reply[seller] error", error);
  }
};

export default function InquiryAnswerModal({ type, open, inquiry, onClose }: InquiryEditModalProps) {
  const queryClient = useQueryClient();
  const toaster = useToaster();
  const [replyId, setReplyId] = useState<string | null>(null);

  useEffect(() => {
    if (inquiry && type === "CompletedAnswer")
      responseAnswer(inquiry.id).then((res) => {
        const data = res?.data as InquiryDetailAnswer;
        if (data.reply) {
          setReplyId(data.reply.id);
          setValue("contents", data.reply.content);
        }
      });
  }, [inquiry, replyId]);

  const statusTypeCheckValue = (WaitingAnswer: StatusTypeCheckValueType, CompletedAnswer: StatusTypeCheckValueType) =>
    type === "WaitingAnswer" ? WaitingAnswer : CompletedAnswer;

  const answerMutation = useMutation({
    mutationFn: async (data: InquiryReplyRequest) => {
      const url = `/inquiries/${type === "WaitingAnswer" ? inquiry?.id : replyId}/replies`;
      const response =
        type === "WaitingAnswer"
          ? await axiosInstance.post<InquiryReply>(url, data)
          : await axiosInstance.patch(url, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["answer", inquiry?.id] });
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      toaster("info", "답변이 수정됐습니다.");
      onClose();
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<inquiryReplyForm>({
    resolver: zodResolver(inquiryReply),
    defaultValues: {
      contents: "",
    },
  });
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (inquiry) {
      reset({
        contents: "",
      });
    }
  }, [inquiry, reset]);

  const onSubmit = (data: inquiryReplyForm) => {
    answerMutation.mutate({
      content: data.contents,
    });
  };

  if (!inquiry) return <div className="hidden"></div>;

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
        <div className="text-black01 mb-6 text-[1.75rem] font-extrabold">문의 답변하기</div>
        <Divder className="mt-5 mb-10" />
        <div className="mb-10 flex w-130 flex-col gap-5">
          <div className="mb-3 flex items-center gap-5">
            <div className="relative h-20 w-20">
              <Image
                src={hasError ? "/images/Mask-group.svg" : (inquiry.product.image ?? "/images/Mask-group.svg")}
                alt={inquiry.product.name ?? "상품 이미지"}
                fill
                className="rounded-md object-cover"
                onError={() => setHasError(true)}
              />
            </div>
            <div className="">
              <h3 className="text-black01 mb-1 text-base font-bold">{inquiry.product.name}</h3>
              <p className="text-black01 mb-1 text-base font-normal">{inquiry.user.name}</p>
              <p className="text-gray01 text-base font-normal">
                작성일:
                {new Date(inquiry.createdAt).toISOString().split("T")[0]}
              </p>
            </div>
          </div>
          <div className="">
            <h3 className="mb-2 flex text-base font-bold">
              {inquiry.isSecret ? (
                <Image
                  className="mr-1"
                  src="/icon/icon_lock.svg"
                  alt="닫기"
                  width={24}
                  height={24}
                />
              ) : null}
              {inquiry.title}
            </h3>
            <p className="text-base">{inquiry.content}</p>
          </div>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-2.5">
            <Controller
              name="contents"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  id="contents"
                  label={statusTypeCheckValue("답변 작성", "답변 수정")}
                  placeholder="답변을 작성해주세요."
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
              disabled={answerMutation.isPending}
            />
            <Button
              label={answerMutation.isPending ? "처리 중..." : statusTypeCheckValue("답변 등록", "답변 수정")}
              size="medium"
              variant="primary"
              color="black"
              className="h-16.25 w-full"
              type="submit"
              disabled={answerMutation.isPending}
            />
          </div>
        </form>
      </div>
    </Modal>
  );
}
