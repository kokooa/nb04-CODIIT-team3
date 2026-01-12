"use client";

import Button from "@/components/button/Button";
import Input from "@/components/input/Input";
import { LoginFormData, LoginSchema } from "@/lib/schemas/login.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    mode: "onTouched",
  });

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
            label="비밀번호"
            type="password"
            placeholder="비밀번호 입력"
            {...register("password")}
          />
          {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
        </div>
      </div>
      <Button
        label="로그인"
        size="large"
        variant="primary"
        type="submit"
        className="h-[4rem] w-[31.25rem]"
      />
    </form>
  );
}
