"use client";

import { postLogin } from "@/lib/api/auth";
import { LoginFormData } from "@/lib/schemas/login.schemas";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import { useUserStore } from "@/stores/userStore";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const { accessToken, setUser, setAccessToken } = useUserStore();
  const toaster = useToaster();

  const loginMutation = useMutation({
    mutationFn: postLogin,
    onSuccess: (data) => {
      setUser(data.user);
      setAccessToken(data.accessToken);

      toaster("info", "로그인에 성공했습니다.");
      router.push("/products");
    },
    onError: (error: unknown) => {
      let message = "";
      if (axios.isAxiosError(error)) {
        switch (error.response?.status) {
          case 400:
            message = "잘못된 요청입니다.";
            break;
          case 401:
            message = "이메일 또는 비밀번호가 올바르지 않습니다.";
            break;
          case 404:
            message = "사용자를 찾을 수 없습니다.";
            break;
          default:
            message = "로그인 중 오류가 발생했습니다.";
        }
      } else {
        message = "알 수 없는 오류가 발생했습니다.";
      }
      toaster("warn", message);
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate({
      email: data.email,
      password: data.password,
    });
  };

  useEffect(() => {
    if (accessToken) {
      router.back();
    }
  }, [accessToken, router]);

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center">
      <Image
        src="/icon/logo.svg"
        alt="CODI-IT"
        width={242}
        height={43}
        className="mb-20"
      />
      <LoginForm onSubmit={onSubmit} />
    </div>
  );
}
