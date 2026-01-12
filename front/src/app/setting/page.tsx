"use client";

import Button from "@/components/button/Button";
import Input from "@/components/input/Input";
import { baseUrlSchema, urlFormData } from "@/lib/schemas/baseURL.schemas";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import { useApiStore } from "@/stores/useApiStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const SettingPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<urlFormData>({
    resolver: zodResolver(baseUrlSchema),
  });

  const setBaseURL = useApiStore((state) => state.setBaseURL); // ✅ 상태 설정 함수 가져오기
  const toaster = useToaster();

  const onSubmit = (data: urlFormData) => {
    setBaseURL(data.baseURL);
    toaster("info", "baseURL을 변경했습니다.");
  };

  return (
    <div className="flex h-[90dvh] flex-col items-center justify-center">
      <form
        className="w-125"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className="mb-10 text-center text-[1.75rem] leading-none font-extrabold">API Base URL 입력</h2>
        <Input
          label="Base URL"
          placeholder="서비스에 사용할 API의 base URL을 입력해주세요"
          {...register("baseURL")}
        />
        {errors.baseURL && <p className="mt-2 text-red-500">{errors.baseURL.message}</p>}
        <Button
          label="설정하기"
          className="mt-15 h-16 w-full text-lg"
          variant="primary"
          size="large"
        />
      </form>
    </div>
  );
};

export default SettingPage;
