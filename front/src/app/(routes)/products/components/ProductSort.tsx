const SORT = [
  { text: "별점 높은순", sort: "highRating" },
  { text: "리뷰 많은순", sort: "mostReviewed" },
  { text: "높은 가격순", sort: "highPrice" },
  { text: "낮은 가격순", sort: "lowPrice" },
  { text: "등록일순", sort: "recent" },
  { text: "판매순", sort: "salesRanking" },
];

interface ProductSortProps {
  sorted: string;
  onClick: (sort: string) => void;
}

const ProductSort = ({ sorted, onClick }: ProductSortProps) => {
  return (
    <div className="flex gap-2.5">
      {SORT.map((item) => (
        <button
          className={`text-black01 h-11.25 rounded-2xl border px-5 ${item.sort === sorted ? "border-black01 font-bold" : "border-gray03"}`}
          key={item.sort}
          onClick={() => onClick(item.sort)}
        >
          {item.text}
        </button>
      ))}
    </div>
  );
};

export default ProductSort;
