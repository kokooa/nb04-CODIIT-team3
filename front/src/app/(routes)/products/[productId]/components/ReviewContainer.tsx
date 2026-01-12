"use client";

import PageButton from "@/components/button/PageButton";
import { getReviewList } from "@/lib/api/review";
import { ReviewCount } from "@/types/Product";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import ReviewList from "./ReviewList";
import ReviewOverview from "./ReviewOverview";

const ITEMS_PER_PAGE = 5;

interface ReviewContainerProps {
  productId: string;
  reviewCount?: ReviewCount;
}

const ReviewContainer = ({ productId, reviewCount }: ReviewContainerProps) => {
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지

  const { data: reviewData } = useQuery({
    queryKey: ["reviews", productId, currentPage],
    queryFn: () => getReviewList({ productId, page: currentPage, limit: ITEMS_PER_PAGE }),
  });

  return (
    <div>
      <h2 className="text-black01 mb-10 text-[1.75rem] font-extrabold">상품 리뷰 ({reviewData?.meta.total})</h2>
      {reviewCount && <ReviewOverview reviewCount={reviewCount} />}
      <ReviewList data={reviewData?.items} />
      <PageButton
        currentPage={currentPage}
        total={reviewData?.meta.total}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default ReviewContainer;
