import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string({ required_error: "이메일을 입력해주세요" }).email({ message: "이메일 형식으로 작성해 주세요" }),
  password: z
    .string()
    .min(8, "비밀번호는 최소 8자 이상이어야 합니다")
    .regex(/^[A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+$/, "비밀번호는 영문, 숫자, 특수문자로만 가능합니다"),
});

export type LoginFormData = z.infer<typeof LoginSchema>;
