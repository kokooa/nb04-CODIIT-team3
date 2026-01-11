"use client";

import { postSignup } from "@/lib/api/auth";
import { SignupFormData } from "@/lib/schemas/signup.schemas";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import { useUserStore } from "@/stores/userStore";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SignupForm from "./SignupForm";

export default function SignupPage() {
  const router = useRouter();
  const toaster = useToaster();
  const { accessToken } = useUserStore();

  const signupMutation = useMutation({
    mutationFn: postSignup,
    onSuccess: () => {
      toaster("info", "회원가입에 성공했습니다. 로그인 페이지로 이동합니다");
      router.push("/login");
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        toaster("warn", "이미 존재하는 이메일입니다. 다른 이메일을 사용해주세요.");
      } else {
        toaster("warn", "회원가입 중 오류가 발생했습니다.");
      }
    },
  });

  const onSubmit = (data: SignupFormData) => {
    signupMutation.mutate({
      name: data.name,
      email: data.email,
      password: data.password,
      type: data.userType.toUpperCase() as "BUYER" | "SELLER",
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
      <SignupForm onSubmit={onSubmit} />
    </div>
  );
}
