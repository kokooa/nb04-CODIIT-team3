import { getAxiosInstance } from "@/lib/api/axiosInstance";
import { useOrderStore } from "@/store/orderStore";
import { User } from "@/types/auth";
import { ProductInfoData } from "@/types/Product";
import { useQuery } from "@tanstack/react-query";

export default function OrderPointSection() {
  const axiosInstance = getAxiosInstance();
  const { orderInfo, setOrderInfo, selectedItems } = useOrderStore();

  const { data: user } = useQuery({
    queryKey: ["User"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<User>("/users/me");
      return data;
    },
  });

  // 주문 상품의 총 가격 계산
  const totalProductPrice = selectedItems.reduce((sum, item) => {
    const discountedPrice = Math.floor((item.product as ProductInfoData).discountPrice ?? item.product.price * (1 - item.product.discountRate / 100));
    return sum + discountedPrice * item.quantity;
  }, 0);

  // 사용 가능한 최대 포인트 (보유 포인트와 총 상품 가격 중 작은 값)
  const maxUsablePoints = Math.min(user?.points ?? 0, totalProductPrice);

  const handleUseAllPoints = () => {
    setOrderInfo({ usePoint: maxUsablePoints });
  };

  const handlePointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // 빈 문자열이면 0으로 설정
    if (value === "") {
      setOrderInfo({ usePoint: 0 });
      return;
    }

    // - 또는 + 기호가 포함된 경우 무시
    if (value.includes("-") || value.includes("+")) {
      return;
    }

    const numValue = Number(value);

    // 유효하지 않은 숫자인 경우 무시
    if (isNaN(numValue)) {
      return;
    }

    // 음수는 0으로, 최대 사용 가능 포인트보다 크면 최대값으로 설정
    const validValue = Math.min(Math.max(0, numValue), maxUsablePoints);
    setOrderInfo({ usePoint: validValue });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // - 또는 + 키 입력 방지
    if (e.key === "-" || e.key === "+" || e.key === "e") {
      e.preventDefault();
    }
  };

  // 입력값이 0이면 빈 문자열로 표시, 아니면 해당 값 표시
  const displayValue = orderInfo.usePoint === 0 ? "" : orderInfo.usePoint.toString();

  return (
    <section className="mb-8">
      <h2 className="border-b border-black px-2 py-2.5 text-xl font-extrabold">포인트</h2>
      <div className="mt-[1.875rem] flex flex-col gap-6">
        <div className="flex items-center gap-10">
          <span className="text-base font-bold">보유 포인트</span>
          <span className="text-lg font-extrabold">{user?.points?.toLocaleString() ?? 0}</span>
        </div>
        <div className="flex items-center gap-22">
          <span className="text-base font-bold">사용</span>
          <div className="flex gap-4">
            <input
              type="number"
              min={0}
              max={maxUsablePoints}
              value={displayValue}
              onChange={handlePointChange}
              onKeyDown={handleKeyDown}
              className="w-[15.625rem] appearance-none rounded border border-gray-300 px-5 py-2 text-end [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              onClick={handleUseAllPoints}
              className="border-black01 active:bg-black01 rounded-md border px-[1.75rem] py-[0.875rem] text-base font-bold active:text-white"
            >
              전액사용
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
