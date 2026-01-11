import { z } from "zod";

export const productFormSchema = z
  .object({
    // 상품정보
    name: z
      .string({
        required_error: "상품명을 입력해주세요",
      })
      .min(1, "상품명을 입력해주세요"),
    image: z
      .any({
        required_error: "이미지를 등록해주세요",
      })
      .refine((file) => file instanceof File || file?.length > 0, "이미지를 등록해주세요"),
    // image: z.union([z.instanceof(File), z.null()]).refine((file) => file instanceof File, "이미지를 등록해주세요"),

    price: z
      .number({
        required_error: "상품 가격을 입력해주세요",
      })
      .min(0, "0원 이상 입력해주세요"),
    category: z.enum(["TOP", "BOTTOM", "DRESS", "OUTER", "SKIRT", "SHOES", "ACC"], {
      required_error: "카테고리를 선택해주세요",
    }),

    // 옵션 및 재고
    sizes: z.array(z.string()).min(1, "최소 하나 이상의 사이즈를 선택해야 합니다"),
    stocks: z.record(z.number().min(0).optional()).optional(),

    // 상품 할인
    discount: z.object({
      enabled: z.boolean(),
      value: z.number().min(0, "할인율은 0 이상이어야 합니다").nullable().optional(),
      periodEnabled: z.boolean(),
      periodStart: z.string().nullable().optional(),
      periodEnd: z.string().nullable().optional(),
    }),

    // 상품 상세정보
    detail: z.string().min(1, "상품 상세정보를 입력해 주세요"),
  })
  .superRefine((data, ctx) => {
    const { sizes, stocks = {}, discount } = data;

    // 재고 검증
    const missing = sizes.filter((size) => !(size in stocks));
    missing.forEach((size) => {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "재고를 입력해주세요",
        path: ["stocks", size],
      });
    });

    // 할인 검증
    if (discount.enabled) {
      if (discount.value === null || discount.value === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "할인율을 입력해주세요",
          path: ["discount", "value"],
        });
      }
      if (discount.periodEnabled) {
        if (!discount.periodStart || discount.periodStart.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "할인 기간 시작일을 입력해주세요",
            path: ["discount", "periodStart"],
          });
        }
        if (!discount.periodEnd || discount.periodEnd.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "할인 기간 종료일을 입력해주세요",
            path: ["discount", "periodEnd"],
          });
        }
        if (
          discount.periodStart &&
          discount.periodEnd &&
          new Date(discount.periodStart) >= new Date(discount.periodEnd)
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "할인 기간의 시작일은 종료일보다 이전이어야 합니다",
            path: ["discount", "periodEnd"],
          });
        }
      }
    }
  });

export type ProductFormValues = z.infer<typeof productFormSchema>;
