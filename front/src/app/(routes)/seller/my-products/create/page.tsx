"use client";

import { createProduct } from "@/lib/api/products";
import { ProductFormValues } from "@/lib/schemas/productForm.schema";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import ProductForm from "../components/ProductForm";

export default function ProductCreatePage() {
  const toaster = useToaster();
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toaster("info", "상품을 등록했습니다");
      queryClient.invalidateQueries({ queryKey: ["productList"] });
      router.push("/seller/my-products");
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toaster("warn", "상품 등록 실패: " + error.message);
      } else {
        toaster("warn", "상품 등록 실패: 알 수 없는 에러");
      }
    },
  });

  const handleCreate = (data: ProductFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="mx-auto mt-[60px] mb-[120px] flex w-[1520px] flex-col">
      <div className="mb-10 text-[28px] font-extrabold">상품 등록</div>
      <ProductForm onSubmit={handleCreate} />
    </div>
  );
}
