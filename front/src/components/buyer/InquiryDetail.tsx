import { getAxiosInstance } from "@/lib/api/axiosInstance";
import { Inquiry, InquiryDetailAnswer } from "@/types/inquiry";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

interface InquiryDetailProps {
  inquiry: Inquiry | null;
}

export default function InquiryDetail({ inquiry }: InquiryDetailProps) {
  const axiosInstance = getAxiosInstance();
  const { data: answer } = useQuery({
    queryKey: ["answer", inquiry?.id],
    queryFn: async () => {
      const response = await axiosInstance.get<InquiryDetailAnswer>(`/inquiries/${inquiry!.id}`);
      return response.data;
    },
    enabled: !!inquiry,
  });

  if (!inquiry) return null;

  return (
    <div className="bg-gray05 flex w-full flex-col gap-10 p-10">
      <div className="flex flex-col gap-5">
        <div className="flex gap-5">
          <div className="text-black01 text-[1.75rem] leading-none font-extrabold">Q.</div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-1">
              {answer?.isSecret && (
                <Image
                  src="/icon/icon_lock.svg"
                  alt="lock"
                  width={24}
                  height={24}
                />
              )}
              <p className="text-black01 text-base font-bold">{answer?.title}</p>
            </div>
            <p className="text-black01 text-base font-normal">{answer?.content}</p>
          </div>
        </div>
        {inquiry.status === "CompletedAnswer" && (
          <div className="flex gap-5">
            <div className="text-[1.75rem] leading-none font-extrabold">A.</div>
            <p className="text-black01 text-base font-normal">{answer?.reply?.content ?? "답변이 없습니다."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
