import Button from "@/components/button/Button";
import { getAxiosInstance } from "@/lib/api/axiosInstance";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import { useOrderStore } from "@/store/orderStore";
import { User } from "@/types/User";
import { GradeResponse } from "@/types/grade";
import { useQuery } from "@tanstack/react-query";

interface OrderSummaryProps {
  onClick: () => void;
}

export default function OrderSummary({ onClick }: OrderSummaryProps) {
  const axiosInstance = getAxiosInstance();
  const { selectedItems, orderInfo } = useOrderStore();
  const toast = useToaster();

  // 유저 정보 가져오기
  const { data: user } = useQuery({
    queryKey: ["User"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<User>("/users/me");
      return data;
    },
  });

  // 등급 정보 가져오기
  const { data: gradeData } = useQuery({
    queryKey: ["grades"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<GradeResponse>("/metadata/grade");
      return data;
    },
  });

  // 유저의 등급에 맞는 적립률 찾기
  const userGradeRate = gradeData?.find((grade) => grade.id === user?.grade?.id)?.rate ?? 0;

  // 총 상품금액 계산
  const subtotal = selectedItems.reduce((sum, item) => {
    const price = item.product.price;
    const discountRate = item.product.discountRate;
    const discountedPrice = Math.floor(price * (1 - discountRate / 100));
    return sum + discountedPrice * item.quantity;
  }, 0);

  // 최종 결제금액 계산 (포인트 사용 차감)
  const total = subtotal - orderInfo.usePoint;

  // 적립 예정 포인트 계산 (유저 등급에 따른 적립률 적용)
  const expectedPoints = Math.floor(total * (userGradeRate / 100));
  const disableds = !orderInfo.name || !orderInfo.phone || !orderInfo.address;
  return (
    <div className="w-[31.25rem]">
      <div className="border-gray03 mb-5 rounded-2xl border p-10">
        <div className="flex flex-col gap-5 border-b pb-10">
          <div className="flex justify-between">
            <span className="text-black01 text-base font-bold">총 상품금액</span>
            <span className="text-black01 text-lg font-extrabold">{subtotal.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-black01 text-base font-bold">포인트 사용</span>
            <span className="text-black01 text-base font-normal">-{orderInfo.usePoint.toLocaleString()} P</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-12">
          <span className="text-black01 text-2xl font-bold">최종 결제금액</span>
          <span className="text-[2.625rem] font-extrabold">{total.toLocaleString()}원</span>
        </div>
        <div className="text-gray01 mt-1 text-right text-base font-normal">
          {expectedPoints.toLocaleString()}원 적립 예정 ({userGradeRate}%)
        </div>
      </div>
      <Button
        label={`${total.toLocaleString()}원 결제하기`}
        size="large"
        variant="primary"
        color="black"
        className="h-[4rem] w-[31.25rem]"
        // disabled={disableds}
        onClick={() => {
          if (disableds) {
            toast("warn", "모든 정보를 입력해주세요");
            return;
          }
          onClick();
        }}
      />
    </div>
  );
}
