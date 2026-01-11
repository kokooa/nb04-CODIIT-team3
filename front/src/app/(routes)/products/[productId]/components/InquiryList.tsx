import Divder from "@/components/divider/Divder";
import { InquiryData } from "@/types/inquiry";
import Inquiry from "./Inquiry";

interface InquiryListProps {
  data: InquiryData[];
}

const InquiryList = ({ data }: InquiryListProps) => {
  const sortedInquiries = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="mb-15 w-380">
      <div className="border-black01 flex h-17 w-full items-center border-t text-center leading-none font-bold">
        <p className="w-1/5">작성자</p>
        <p className="w-1/10">작성일</p>
        <p className="w-1/2">제목</p>
        <p className="w-1/5">답변상태</p>
      </div>
      <Divder />
      {sortedInquiries.map((inquiry) => (
        <Inquiry
          key={inquiry.id}
          inquiry={inquiry}
        />
      ))}
    </div>
  );
};

export default InquiryList;
