"use client";

import { deleteProduct } from "@/lib/api/products";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ProductDeleteModal from "./ProductDeleteModal";

interface Product {
  id: string;
  imageUrl: string;
  name: string;
  price: number;
  stock: number;
  isSoldout: boolean;
  isDiscounted: boolean;
  createdAt: string;
}

interface ProductProps {
  product: Product;
}

export default function ProductItem({ product }: ProductProps) {
  const router = useRouter();
  const textColorClass = product.isSoldout ? "text-gray01" : "text-black02";
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const toaster = useToaster();
  const queryClient = useQueryClient();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toISOString().slice(0, 10);
  };

  const handleEdit = () => {
    router.push(`/seller/my-products/${product.id}/edit`);
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteProduct(product.id);
      queryClient.invalidateQueries({ queryKey: ["myProducts"] });
      setIsDeleteModalOpen(false);
    } catch {
      toaster("warn", "삭제에 실패했습니다.");
    }
  };

  return (
    <div className="border-gray04 flex h-30 w-full items-center gap-14 border-b px-6 py-4 text-[18px] leading-none">
      <div className="flex w-[33px] flex-col gap-2 text-center">
        <button
          onClick={handleEdit}
          className="text-gray02 underline"
        >
          수정
        </button>
        <button
          onClick={handleDeleteClick}
          className="text-red-300 underline"
        >
          삭제
        </button>
      </div>
      {/* 상품 이미지 */}
      <div className="h-[80px] w-[80px] overflow-hidden rounded-md">
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={80}
          height={80}
        />
      </div>
      {/* 상품명 */}
      <div className="w-[240px] overflow-hidden text-center text-ellipsis whitespace-nowrap">{product.name}</div>
      {/* 판매가 */}
      <div className={`flex w-[75px] items-center justify-center overflow-visible whitespace-nowrap ${textColorClass}`}>
        {product.price.toLocaleString()}원
      </div>
      {/* 재고수량 */}
      <div className={`w-[60px] text-center ${textColorClass}`}>{product.stock.toLocaleString()}</div>
      {/* 품절 여부 */}
      <div className={`w-[169px] text-center ${textColorClass}`}>{product.isSoldout ? "Y" : "N"}</div>
      {/* 할인 여부 */}
      <div className={`w-[63px] text-center ${textColorClass}`}>{product.isDiscounted ? "Y" : "N"}</div>
      {/* 상품 등록일 */}
      <div className={`w-[102px] text-center ${textColorClass}`}>{formatDate(product.createdAt)}</div>
      {/* 삭제 확인 모달 */}
      <ProductDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        productName={product.name}
      />
    </div>
  );
}
