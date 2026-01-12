import { z } from "zod";

export const baseUrlSchema = z.object({
  baseURL: z.string().url("올바른 URL 형식을 입력해주세요").nonempty("Base URL은 필수 항목입니다"),
});

export type urlFormData = z.infer<typeof baseUrlSchema>;
