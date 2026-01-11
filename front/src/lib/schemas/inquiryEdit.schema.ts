import { z } from "zod";

export const inquiryEditSchemas = z.object({
  title: z.string().min(1, "문의 제목을 입력하세요").max(50, "문의 제목은 최대 50자까지 입력 가능합니다"),
  contents: z.string().min(1, "문의 내용을 입력하세요").max(500, "문의 내용은 최대 500자까지 입력 가능합니다"),
  isSecret: z.boolean(),
});

export type inquiryEditForm = z.infer<typeof inquiryEditSchemas>;
