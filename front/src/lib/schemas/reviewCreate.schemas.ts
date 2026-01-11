import { z } from "zod";

export const reviewCreateSchemas = z.object({
  rating: z.number().min(1, "별점을 선택해주세요").max(5, "별점은 5점까지입니다"),
  content: z.string().min(10, "최소 10자 이상 입력").max(500, "최대 500자까지 입력 가능합니다"),
});

export type ReviewCreateForm = z.infer<typeof reviewCreateSchemas>;
