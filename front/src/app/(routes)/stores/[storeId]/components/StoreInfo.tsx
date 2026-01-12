"use client";

import { deleteFavoriteStore, getStoreDetail, postFavoriteStore } from "@/lib/api/store";
import { getFavoriteStore } from "@/lib/api/userProfile";
import { useUserStore } from "@/stores/userStore";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useState } from "react";

interface StoreInfoProps {
  storeId: string;
}

const StoreInfo = ({ storeId }: StoreInfoProps) => {
  const { user } = useUserStore();

  const {
    data: storeData,
    isLoading,
    refetch: refetchStore,
  } = useQuery({
    queryKey: ["store", storeId],
    queryFn: () => getStoreDetail(storeId),
  });
  const [image, setImage] = useState<string>("/images/sample-store.png");

  const favoriteCount = storeData?.favoriteCount ?? 0;
  const favorite = favoriteCount < 1000 ? favoriteCount : (favoriteCount / 1000).toFixed(1) + "k";

  const { data: favoriteData, refetch: refetchFavorite } = useQuery({
    queryKey: ["favoriteStores"],
    queryFn: getFavoriteStore,
    enabled: !!user, // user가 있을 때만 실행
  });

  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = async () => {
    if (isFavorite) {
      await deleteFavoriteStore(storeId);
      setIsFavorite((prev) => !prev);
      refetchStore();
      refetchFavorite();
      return;
    } else {
      await postFavoriteStore(storeId);
      setIsFavorite((prev) => !prev);
      refetchStore();
      refetchFavorite();
      return;
    }
  };

  useEffect(() => {
    if (favoriteData?.find((i) => i.store.id === storeId)) {
      setIsFavorite(true);
    } else {
      setIsFavorite(false);
    }
  }, [storeId, favoriteData, isFavorite]);

  useEffect(() => {
    if (!isLoading && storeData) {
      if (storeData.image && storeData.image.trim() !== "") {
        setImage(storeData.image);
      } else {
        setImage("/images/sample-store.png");
      }
    }
  }, [isLoading, storeData]);

  return (
    <div className="space-y-10">
      <div className="relative h-60 w-380">
        {storeData && (
          <Image
            className="rounded-2xl object-cover"
            src={image}
            alt="image"
            priority
            fill
            unoptimized
            onError={() => setImage("/images/sample-store.png")}
          />
        )}
      </div>
      <div className="flex justify-between">
        <div className="space-y-5">
          <p className="text-black01 text-2xl leading-none font-bold">{storeData?.name}</p>
          <div className="space-y-3.5 text-base leading-none">
            <div className="flex">
              <p className="text-gray01 w-17 font-bold">주소</p>
              <p className="text-black02">{storeData?.address}</p>
            </div>
            <div className="flex">
              <p className="text-gray01 w-17 font-bold">연락처</p>
              <p className="text-black02">{storeData?.phoneNumber}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-[0.375rem] px-[1.625rem] py-[0.7188rem]">
          {isFavorite ? (
            <Image
              src="/icon/heart.svg"
              alt="icon"
              width={50}
              height={50}
              onClick={toggleFavorite}
            />
          ) : (
            <Image
              src="/icon/heart_empty.svg"
              alt="icon"
              width={50}
              height={50}
              onClick={toggleFavorite}
            />
          )}
          <p className="text-black02 text-base">{favorite}</p>
        </div>
      </div>
      <div className="text-black01 bg-gray05 p-10 text-base leading-relaxed">
        {storeData?.content.split("\n").map((text, i) => <p key={i}>{text}</p>)}
      </div>
    </div>
  );
};

export default StoreInfo;
