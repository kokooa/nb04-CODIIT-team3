import Modal from "@/components/Modal";
import Button from "@/components/button/Button";
import Divder from "@/components/divider/Divder";
import BoxInput from "@/components/input/BoxInput";
import TextArea from "@/components/input/TextArea";
import { PostInquiryParams, getProductDetail, postProductInquiry } from "@/lib/api/products";
import { inquiryCreateForm, inquiryCreateSchemas } from "@/lib/schemas/inquiryCreate.schemas";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Image from "next/image";
import { Controller, useForm } from "react-hook-form";

interface InquiryCreateModalProps {
  productId: string;
  onClose: () => void;
}

export default function InquiryCreateModal({ productId, onClose }: InquiryCreateModalProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<inquiryCreateForm>({
    resolver: zodResolver(inquiryCreateSchemas),
    defaultValues: {
      title: "",
      content: "",
      isSecret: false,
    },
  });
  const isSecret = watch("isSecret");
  const toaster = useToaster();

  const { data } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProductDetail(productId),
  });

  const mutation = useMutation({
    mutationFn: (data: PostInquiryParams) => postProductInquiry(data),
    onSuccess: () => {
      toaster("info", "문의가 성공적으로 등록되었습니다.");
      onClose();
    },
    onError: (error: AxiosError) => {
      if (error.status === 401) {
        toaster("warn", "로그인이 필요합니다.");
        onClose();
      } else {
        toaster("warn", "문의 등록에 실패했습니다.");
        onClose();
      }
    },
  });

  const onSubmit = (data: inquiryCreateForm) => {
    mutation.mutate({ productId, ...data });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
    >
      <div className="text-black01 relative text-[1.75rem] leading-none font-extrabold">
        <h2>상품 문의</h2>
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
      </div>
      <Divder className="mt-5 mb-10" />{" "}
      <div className="mb-10 flex w-130 gap-5">
        {data && (
          <Image
            className="h-20 w-20 rounded-md object-cover"
            src={data?.image}
            alt="image"
            width={80}
            height={80}
          />
        )}
        <div className="flex w-105 flex-col justify-center gap-2.5">
          <p className="text-gray01 text-base leading-none">{data?.storeName}</p>
          <p className="overflow-hidden text-lg leading-none font-bold text-ellipsis whitespace-nowrap">{data?.name}</p>
        </div>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-130 space-y-10 text-left"
      >
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <BoxInput
              label="제목"
              checkbox={true}
              isSecret={isSecret}
              placeholder="문의 제목을 입력해주세요"
              onCheckboxChange={(e) => {
                setValue("isSecret", e.target.checked);
              }}
              {...field}
            />
          )}
        />
        {errors.title && <p className="mt-[-2rem] text-red-500">{errors.title.message}</p>}
        <TextArea
          label="문의 내용"
          placeholder="궁금한 내용을 입력해 주세요"
          {...register("content")}
        />
        {errors.content && <p className="mt-[-2rem] text-red-500">{errors.content.message}</p>}
        <div className="mt-10 flex gap-5">
          <Button
            label="취소"
            size="large"
            variant="secondary"
            color="white"
            className="h-16.25 w-full"
            onClick={onClose}
          />
          <Button
            type="submit"
            label="문의 등록"
            size="large"
            variant="primary"
            color="black"
            className="h-16.25 w-full"
          />
        </div>
      </form>
    </Modal>
  );
}
