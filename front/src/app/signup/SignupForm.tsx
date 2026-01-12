"use client";

import Button from "@/components/button/Button";
import Input from "@/components/input/Input";
import { SignupFormData, SignupSchema } from "@/lib/schemas/signup.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useForm } from "react-hook-form";

interface SignupFormProps {
  onSubmit: (data: SignupFormData) => void;
}

export default function SignupForm({ onSubmit }: SignupFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(SignupSchema),
    mode: "onTouched",
    defaultValues: {
      userType: "seller",
    },
  });
  const selectedType = watch("userType");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-[50px]"
    >
      <div className="flex flex-col gap-[38px]">
        <div>
          <Input
            label="이메일"
            type="email"
            placeholder="이메일 주소 입력"
            {...register("email")}
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
        </div>
        <div>
          <Input
            label="닉네임"
            type="name"
            placeholder="닉네임 입력"
            {...register("name")}
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <Input
            label="비밀번호"
            type="password"
            placeholder="비밀번호 입력"
            {...register("password")}
          />
          {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
        </div>
        <div>
          <Input
            label="비밀번호 확인"
            type="password"
            placeholder="비밀번호 확인"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>}
        </div>
        <div className="flex flex-col gap-5 text-base font-bold">
          <span>회원 유형</span>
          <div className="flex gap-4">
            {["seller", "buyer"].map((type) => (
              <label
                key={type}
                htmlFor={`userType-${type}`}
                className={`relative flex h-[60px] w-[240px] cursor-pointer items-center justify-between rounded-xl border transition-all ${selectedType === type ? "border-black01 opacity-100" : "border-gray-300 opacity-50"} `}
              >
                <input
                  type="radio"
                  id={`userType-${type}`}
                  value={type}
                  {...register("userType")}
                  className="hidden"
                />
                <span className="py-[21px] pl-[30px]">{type === "seller" ? "셀러" : "바이어"}</span>
                {selectedType === type && (
                  <Image
                    src="/icon_check.svg"
                    alt="check"
                    width={28}
                    height={28}
                    className="mr-[16px]"
                  />
                )}
              </label>
            ))}
          </div>
          {errors.userType && <p className="mt-1 text-sm text-red-500">{errors.userType.message}</p>}
        </div>
      </div>
      <Button
        label="회원가입"
        size="large"
        variant="primary"
        type="submit"
        className="h-[4rem] w-[31.25rem]"
      />
    </form>
  );
}
