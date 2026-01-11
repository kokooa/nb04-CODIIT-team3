"use client";

import { Product } from "@/types/Product";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import Stars from "../[productId]/components/Stars";

interface ProductItemProps {
  product: Product;
  store?: boolean;
}

const ProductItem = ({ product, store = false }: ProductItemProps) => {
  const [imgSrc, setImgSrc] = useState(product.image);

  return (
    <div className="text-black01 group flex w-full flex-col">
      <Link href={`/products/${product.id}`}>
        <div className="relative mb-5 aspect-square w-full overflow-hidden rounded-xl">
          <Image
            className="object-cover transition-all duration-100 group-hover:scale-105"
            src={imgSrc && imgSrc.trim() !== "" ? imgSrc : "/icon/image_fail.svg"}
            alt="image"
            priority
            sizes="50vw"
            fill
            unoptimized
            onError={() => setImgSrc("/icon/image_fail.svg")}
          />
        </div>
        {store && <p className="text-black02 mb-2.5 text-sm leading-none">{product.storeName}</p>}
        <p className="mb-2.5 overflow-hidden leading-5 font-bold text-ellipsis whitespace-nowrap">{product.name}</p>
        <div className="mb-2.5 flex gap-1.25 text-lg leading-5">
          <p className="font-extrabold">{Math.floor(product.discountPrice).toLocaleString()}원</p>
          {product.discountRate !== 0 && (
            <p className="text-gray01 font-bold line-through">{product.price.toLocaleString()}원</p>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Stars
            rating={product.reviewsRating}
            size="small"
          />
          <p className="text-sm leading-none underline">리뷰 {product.reviewsCount}개</p>
        </div>
      </Link>
    </div>
  );
};

export default ProductItem;
