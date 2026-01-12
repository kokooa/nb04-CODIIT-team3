import Modal from "@/components/Modal";
import Button from "@/components/button/Button";
import BoxInput from "@/components/input/BoxInput";
import TextArea from "@/components/input/TextArea";
import { StoreCreateForm, storeCreateSchema } from "@/lib/schemas/storecreate.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useController, useForm } from "react-hook-form";

interface StoreFormProps {
  mode: "create" | "edit";
  onClose: () => void;
  onSubmit: (data: StoreCreateForm) => Promise<void>;
  defaultValues?: Partial<StoreCreateForm>;
  imagePreviewUrl?: string;
}

export default function StoreForm({ mode, onClose, onSubmit, defaultValues, imagePreviewUrl }: StoreFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<StoreCreateForm>({
    resolver: zodResolver(storeCreateSchema),
    defaultValues,
  });

  // defaultValues 변경 시 폼 리셋
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const {
    field: imageField,
    fieldState: { error: imageError },
  } = useController({
    name: "image",
    control,
  });

  const [preview, setPreview] = useState<string | null>(null);

  const isValidImage = (src?: string | null) => {
    if (!src || src.trim() === "") return false;
    return src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/") || src.startsWith("blob:");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      imageField.onChange(file);

      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

  useEffect(() => {
    if (typeof imageField.value === "string" && imageField.value) {
      setPreview(imageField.value);
    }
  }, [imageField.value]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    if (imagePreviewUrl) {
      setPreview(imagePreviewUrl);
    }
  }, [imagePreviewUrl]);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative w-[599px] text-left"
      >
        <div className="relative w-[599px] text-left">
          <p className="text-[28px] font-extrabold">{mode === "create" ? "스토어 등록" : "스토어 수정"}</p>
          <div className="bg-gray04 mt-5 mb-10 h-px w-full" />
          <button
            className="absolute top-0 right-0"
            onClick={onClose}
            type="button"
          >
            <Image
              src="/icon/deleteBlack.svg"
              alt="닫기"
              width={24}
              height={24}
            />
          </button>
          <BoxInput
            label="스토어명"
            placeholder="스토어 이름 입력"
            {...register("storeName")}
          />
          {errors.storeName && <p className="mt-[1px] text-red-500">{errors.storeName.message}</p>}

          <div className="bg-gray04 mt-[1.875rem] mb-[1.875rem] h-px w-full" />
          <div className="flex flex-col">
            <label className="mb-5 text-xl font-bold">주소</label>
            <input
              placeholder="기본 주소"
              className="border-gray03 placeholder:text-gray02 mb-[10px] flex h-15 rounded-md border bg-white p-5 text-base leading-none font-normal"
              {...register("address.basic")}
            />
            <input
              placeholder="상세 주소 입력"
              className="border-gray03 placeholder:text-gray02 flex h-15 rounded-md border bg-white p-5 text-base leading-none font-normal"
              {...register("address.detail")}
            />
            {errors.address?.basic && <p className="mt-[1px] text-red-500">{errors.address.basic.message}</p>}
            {errors.address?.detail && <p className="mt-[1px] text-red-500">{errors.address.detail.message}</p>}
          </div>

          <div className="bg-gray04 mt-[1.875rem] mb-[1.875rem] h-px w-full" />
          <BoxInput
            label="전화번호"
            placeholder="스토어 전화번호 입력"
            {...register("phoneNumber")}
          />
          {errors.phoneNumber && <p className="mt-[1px] text-red-500">{errors.phoneNumber.message}</p>}

          <div className="bg-gray04 mt-[1.875rem] mb-[1.875rem] h-px w-full" />
          <label className="flex flex-col gap-5 text-xl font-bold">
            스토어 이미지
            <input
              type="file"
              accept="image/*"
              id="store-image-input"
              onChange={handleImageChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => document.getElementById("store-image-input")?.click()}
              className="bg-gray05 relative h-[240px] w-[240px] overflow-hidden rounded-md p-[100px]"
            >
              {preview && isValidImage(preview) ? (
                <Image
                  src={preview}
                  alt="선택된 이미지"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Image
                    src="/icon/gallery.svg"
                    alt="스토어 이미지 첨부"
                    width={40}
                    height={40}
                  />
                </div>
              )}
            </button>
            {imageError && <p className="text-base font-normal text-red-500">{imageError.message}</p>}
          </label>

          <div className="bg-gray04 mt-[1.875rem] mb-[1.875rem] h-px w-full" />
          <TextArea
            label="스토어 설명"
            placeholder="최소 10자 이상 입력"
            {...register("description")}
          />
          {errors.description && <p className="mt-[1px] text-red-500">{errors.description.message}</p>}
        </div>

        <div className="mt-10 flex gap-5">
          <Button
            type="button"
            label="취소"
            size="large"
            variant="secondary"
            color="white"
            onClick={onClose}
            className="h-[65px] w-full text-[18px]"
          />
          <Button
            type="submit"
            label={mode === "create" ? "스토어 등록" : "스토어 수정"}
            size="large"
            variant="primary"
            color="black"
            className="h-[65px] w-full text-[18px]"
          />
        </div>
      </form>
    </Modal>
  );
}
