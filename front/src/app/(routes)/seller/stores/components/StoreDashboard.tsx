import { StoreDetailResponse } from "@/types/store";
import Image from "next/image";
import { StoreInfo } from "./StoreInfo";
import { StoreStats } from "./StoreStats";

export default function StoreDashboard({ store }: { store: StoreDetailResponse }) {
  const isValidImage = (src?: string) => {
    if (!src) return false;
    if (src.trim() === "") return false;
    if (src.startsWith("http://") || src.startsWith("https://")) return true;
    if (src.startsWith("/")) return true;
    return false;
  };

  const imageSrc = isValidImage(store.image) ? store.image : "/images/sample-store.png";

  return (
    <div>
      {/* 이미지 */}
      <div className="relative flex h-[240px] items-center justify-center overflow-hidden rounded-2xl">
        <Image
          src={imageSrc}
          alt="스토어 이미지"
          fill
          className="object-cover"
        />
      </div>
      <div className="mt-10 flex justify-between gap-10">
        {/* 스토어 정보 */}
        <StoreInfo store={store} />
        {/* 스토어 통계 */}
        <StoreStats
          stats={[
            { label: "누적 판매 수", value: store.totalSoldCount },
            { label: "등록된 제품", value: store.productCount },
            { label: "이번 달 관심", value: store.monthFavoriteCount },
          ]}
        />
      </div>
    </div>
  );
}
