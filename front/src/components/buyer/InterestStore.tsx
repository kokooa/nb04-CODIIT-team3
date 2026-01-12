import { getAxiosInstance } from "@/lib/api/axiosInstance";
import { StoreLike } from "@/types/store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface InterestStoreProps {
  initialStores?: StoreLike[];
}

// URL 유효성 검사 함수
const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export default function InterestStore({ initialStores = [] }: InterestStoreProps) {
  const axiosInstance = getAxiosInstance();
  const [storePage, setStorePage] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { data: stores = initialStores } = useQuery({
    queryKey: ["storeLikes"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<StoreLike[]>("/users/me/likes");
      return data;
    },
    initialData: initialStores,
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (storeId: string) => {
      await axiosInstance.delete(`/stores/${storeId}/favorite`);
      return storeId;
    },
    onMutate: async (storeId: string) => {
      await queryClient.cancelQueries({ queryKey: ["storeLikes"] });
      const previousStores = queryClient.getQueryData<StoreLike[]>(["storeLikes"]);
      queryClient.setQueryData<StoreLike[]>(["storeLikes"], (old = []) =>
        old.filter((item) => item.storeId !== storeId)
      );
      return { previousStores };
    },
    onError: (err, storeId, context) => {
      if (context?.previousStores) {
        queryClient.setQueryData(["storeLikes"], context.previousStores);
      }
      alert("관심 스토어 삭제에 실패했습니다.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["storeLikes"] });
    },
  });

  const handleImageError = (storeId: string) => {
    setImageErrors((prev) => new Set(prev).add(storeId));
  };

  const itemsPerPage = 5;
  const totalStores = stores.length;
  const maxPage = Math.ceil(totalStores / itemsPerPage) - 1;

  const handlePrev = () => setStorePage((prev) => Math.max(prev - 1, 0));
  const handleNext = () => setStorePage((prev) => Math.min(prev + 1, maxPage));

  const pagedStores = stores.slice(storePage * itemsPerPage, storePage * itemsPerPage + itemsPerPage);

  return (
    <div className="mb-20 flex w-full flex-col gap-2.5">
      <span className="text-black01 py-[0.3125rem] text-lg font-extrabold">관심 스토어 목록</span>
      <div className="relative w-full">
        <div className="flex w-full justify-start gap-5.5">
          {pagedStores.map((item) => {
            const hasImageError = imageErrors.has(item.store.id);
            const isValidImage = item.store.image && isValidImageUrl(item.store.image);
            const imageSrc = hasImageError || !isValidImage ? "/images/Mask-group.svg" : item.store.image;

            return (
              <Link
                href={`/stores/${item.store.id}`}
                key={item.store.id}
                className="flex max-w-[240px] flex-shrink-0 basis-[240px] flex-col gap-4"
              >
                <div className="relative aspect-square w-full">
                  <Image
                    src={imageSrc}
                    alt={item.store.name}
                    fill
                    className="rounded-xl object-cover"
                    onError={() => handleImageError(item.store.id)}
                  />
                  <button
                    className="absolute right-4 bottom-4 h-7.5 w-7.5 cursor-pointer"
                    onClick={() => removeFavoriteMutation.mutate(item.store.id)}
                    disabled={removeFavoriteMutation.status === "pending"}
                  >
                    <Image
                      src="/icon/icon_heart.svg"
                      alt="heart"
                      fill
                      className="object-cover"
                    />
                  </button>
                </div>
                <div className="flex flex-col gap-2.5">
                  <span className="text-black01 text-base font-bold">{item.store.name}</span>
                  <span className="text-gray01 text-sm font-normal">{item.store.address}</span>
                </div>
              </Link>
            );
          })}
          {/* 빈 카드로 5개 맞추기 */}
          {Array.from({ length: itemsPerPage - pagedStores.length }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="flex max-w-[240px] flex-shrink-0 basis-[240px] flex-col gap-4"
            />
          ))}
        </div>
        {storePage > 0 && (
          <div
            className="border-gray02 absolute top-[7rem] -left-7 z-10 flex h-[54px] w-[54px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border bg-white shadow-md"
            onClick={handlePrev}
          >
            <Image
              src="/icon/icon_arrow_right.svg"
              alt="이전"
              width={24}
              height={24}
              className="rotate-180"
            />
          </div>
        )}
        {storePage < maxPage && (
          <div
            className="border-gray02 absolute top-[7rem] -right-7 z-10 flex h-[54px] w-[54px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border bg-white shadow-md"
            onClick={handleNext}
          >
            <Image
              src="/icon/icon_arrow_right.svg"
              alt="다음"
              width={24}
              height={24}
            />
          </div>
        )}
      </div>
    </div>
  );
}
