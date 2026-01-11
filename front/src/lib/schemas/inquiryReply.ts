import { z } from "zod";

export const inquiryReply = z.object({
  contents: z.string().min(1, "답변 내용을 입력하세요").max(500, "답변 내용은 최대 500자까지 입력 가능합니다"),
});

export type inquiryReplyForm = z.infer<typeof inquiryReply>;
