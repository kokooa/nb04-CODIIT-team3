"use client";

import Divder from "@/components/divider/Divder";
import { getProductDetail } from "@/lib/api/products";
import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import InquiryContainer from "./components/InquiryContainer";
import ProductInfo from "./components/ProductInfo";
import ReviewContainer from "./components/ReviewContainer";

const ProductDetailPage = ({ params }: { params: Promise<{ productId: string }> }) => {
  const { productId } = use(params);
  const { data: productDetail } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProductDetail(productId),
  });

  return (
    <div className="w-380">
      {productDetail && (
        <ProductInfo
          productId={productId}
          data={productDetail}
        />
      )}
      <Divder className="my-20" />
      <InquiryContainer productId={productId} />
      <Divder className="mt-9.5 mb-24" />
      <ReviewContainer
        productId={productId}
        reviewCount={productDetail?.reviews}
      />
    </div>
  );
};

export default ProductDetailPage;
