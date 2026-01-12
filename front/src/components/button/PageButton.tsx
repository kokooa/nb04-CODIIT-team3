import React from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

interface PageButtonProps {
  total: number | undefined; // 전체 아이템 개수
  itemsPerPage: number; // 한 페이지에 표시할 아이템 개수
  currentPage: number; // 현재 페이지 번호
  onPageChange: (page: number) => void; // 	페이지 상태 업데이트
}

const PageButton = ({ total = 1, itemsPerPage, currentPage, onPageChange }: PageButtonProps) => {
  const totalPages = Math.ceil(total / itemsPerPage); // 전체 페이지 수
  const maxVisible = 10; // 페이지 버튼 그룹 개수

  // 페이지가 속한 그룹 계산 (최대 maxVisible 값 만큼의 개수만 표시)
  const currentGroup = Math.floor((currentPage - 1) / maxVisible);
  const startPage = currentGroup * maxVisible + 1;
  const endPage = Math.min(startPage + maxVisible - 1, totalPages);

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  // 페이지 이동 버튼
  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      const isLastInGroup = currentPage === endPage;
      const nextPage = isLastInGroup ? endPage + 1 : currentPage + 1;
      onPageChange(nextPage);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2.5">
      <button
        className="disabled:border-gray03 border-black01 disabled:text-gray03 text-black01 flex size-11.25 items-center justify-center rounded-md border-2"
        onClick={handlePrev}
        disabled={currentPage === 1}
      >
        <IoIosArrowBack className="size-5.5" />
      </button>
      <div className="flex gap-2.5">
        {pageNumbers.map((page) => (
          <button
            className={`flex size-11.25 items-center justify-center rounded-md text-lg font-bold ${currentPage === page && "bg-black01 text-white"}`}
            key={page}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
      </div>
      <button
        className="disabled:border-gray03 border-black01 disabled:text-gray03 text-black01 flex size-11.25 items-center justify-center rounded-md border-2"
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        <IoIosArrowForward className="size-5.5" />
      </button>
    </div>
  );
};

export default PageButton;
