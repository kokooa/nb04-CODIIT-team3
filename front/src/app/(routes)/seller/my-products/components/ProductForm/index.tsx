"use client";

import Button from "@/components/button/Button";
import { ProductFormValues, productFormSchema } from "@/lib/schemas/productForm.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ProductDetailSection } from "./ProductDetailSection";
import { ProductDiscountSection } from "./ProductDiscountSection";
import { ProductInfoSection } from "./ProductInfoSection";
import { ProductStockSection } from "./ProductStockSection";

interface ProductFormProps {
  initialValues?: ProductFormValues;
  onSubmit: (data: ProductFormValues) => void;
}

export default function ProductForm({ initialValues, onSubmit }: ProductFormProps) {
  const {
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    mode: "onBlur",
    defaultValues: initialValues ?? {
      name: "",
      image: null,
      price: undefined,
      category: undefined,
      sizes: [],
      stocks: {},
      discount: {
        enabled: false,
        value: null,
        periodEnabled: false,
        periodStart: null,
        periodEnd: null,
      },
    },
  });

  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ProductInfoSection
        control={control}
        errors={errors}
      />
      <ProductStockSection
        control={control}
        errors={errors}
      />
      <ProductDiscountSection
        control={control}
        errors={errors}
      />
      <ProductDetailSection
        control={control}
        errors={errors}
      />
      <div className="mt-[126px] flex justify-center">
        <Button
          type="submit"
          label={initialValues ? "수정하기" : "등록하기"}
          className="h-[65px] w-[500px] text-lg"
          variant="primary"
          size="large"
        />
      </div>
    </form>
  );
}
