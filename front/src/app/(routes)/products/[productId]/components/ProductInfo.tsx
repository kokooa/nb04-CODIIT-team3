"use client";

import Modal from "@/components/Modal";
import Button from "@/components/button/Button";
import Divder from "@/components/divider/Divder";
import OptionSelect from "@/components/select/OptionSelect";
import { getCart, postCart } from "@/lib/api/cart";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import { useUserStore } from "@/stores/userStore";
import { ProductInfoData } from "@/types/Product";
import { CartEditSize } from "@/types/cart";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ProductContent from "./ProductContent";
import ProductOptions from "./ProductOptions";
import Stars from "./Stars";

interface ProductInfoProps {
  productId: string;
  data: ProductInfoData;
}

const ProductInfo = ({ productId, data }: ProductInfoProps) => {
  const [options, setOptions] = useState<CartEditSize[]>([]);
  const { user } = useUserStore();
  const [image, setImage] = useState<string>(data.image);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const router = useRouter();
  const toaster = useToaster();

  // 장바구니 데이터 조회
  const { refetch: refetchCartData } = useQuery({
    queryKey: ["cart"],
    queryFn: () => getCart(),
    enabled: user !== null,
    select: (data) => {
      return data.items
        .filter((i) => i.productId === productId)
        .map((i) => ({
          sizeId: i.sizeId,
          quantity: i.quantity,
          size: i.size, // 백엔드에서 받아온 사이즈 정보
        }));
    },
  });

  // 상품 선택 개수 계산
  const totalCount = options.map((option) => option.quantity).reduce((acc, cur) => acc + cur, 0);

  // 옵션 추가 함수
  const handleSelect = (value: number) => {
    if (options.map((option) => option.sizeId).includes(value)) {
      toaster("warn", "이미 선택한 옵션입니다.");
      return;
    }
    // 2. sizeId(value)에 해당하는 실제 사이즈 이름(예: "L") 찾기
    const selectedStock = data.stocks[value];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stockAny = selectedStock as any;

    let extractedSizeName = "Free"; // 기본값

    if (stockAny?.size) {
      if (typeof stockAny.size === "string") {
        extractedSizeName = stockAny.size; // "L"
      } else if (stockAny.size.name) {
        extractedSizeName = stockAny.size.name; // { name: "L" }
      } else if (stockAny.size.en) {
        extractedSizeName = stockAny.size.en; // { en: "L" }
      } else if (stockAny.size.size && stockAny.size.size.en) {
        extractedSizeName = stockAny.size.size.en; // { size: { en: "L" } }
      }
    }

    console.log("📏 선택된 사이즈 값:", extractedSizeName);
    // 3. state에 저장할 때 size 속성도 같이 포함 (타입 에러 해결!)
    setOptions((prev) => [
      ...prev,
      {
        sizeId: value,
        quantity: 1,
        size: extractedSizeName,
      },
    ]);
  };

  const setModalOpen = () => {
    setIsModalOpen(true);
  };

  // ✅ [최종 수정] 장바구니 담기 함수
  const addCart = async () => {
    if (options.length === 0) {
      toaster("warn", "옵션을 선택해 주세요.");
      return;
    }
    if (!user) {
      toaster("warn", "로그인이 필요합니다.");
      return;
    }
    if (user.type === "SELLER") {
      toaster("warn", "바이어로 로그인해 주세요.");
      return;
    }

    try {
      // 선택한 옵션들을 하나씩 백엔드로 전송 (upsert 로직 이용)
      for (const option of options) {
        const payload = {
          productId: productId,
          size: option.size,
          quantity: option.quantity,
        };

        console.log("🚚 장바구니 담기 요청:", payload);

        // 데이터를 담아서 API 호출!
        await postCart(payload);
      }

      // 성공 시 처리
      await refetchCartData(); // 장바구니 데이터 갱신
      setOptions([]); // 선택된 옵션 초기화
      setModalOpen(); // 성공 모달 띄우기
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.message || "장바구니 담기에 실패했습니다.";
      toaster("warn", msg);
    }
  };

  // ✅ [최종 수정] 구매하기 함수
  const orderProduct = async () => {
    if (options.length === 0) {
      toaster("warn", "옵션을 선택해 주세요.");
      return;
    }
    if (!user) {
      toaster("warn", "로그인이 필요합니다.");
      return;
    }
    if (user.type === "SELLER") {
      toaster("warn", "바이어로 로그인해 주세요.");
      return;
    }

    try {
      // 구매하기도 마찬가지로 장바구니에 먼저 담아야 주문이 가능할 것 같으므로 같은 로직 사용
      for (const option of options) {
        await postCart({
          productId: productId,
          size: option.size,
          quantity: option.quantity,
        });
      }

      // 장바구니에 다 담았으면 주문 페이지로 이동
      router.push("/buyer/order");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.message || "구매하기 이동 실패";
      toaster("warn", msg);
    }
  };

  return (
    <>
      <div className="flex items-start justify-between">
        <div className="relative size-182.5">
          {data.image && (
            <Image
              className="rounded-xl object-cover"
              src={image}
              alt="image"
              priority
              fill
              unoptimized
              onError={() => setImage("/icon/image_fail.svg")}
            />
          )}
        </div>
        <div className="w-182.5">
          <Link
            className="text-gray01 mb-2.5 flex w-fit items-center gap-2.5 text-lg leading-none"
            href={`/stores/${data.storeId}`}
          >
            {data.storeName}
            <Image
              src="/icon/arrowRight.svg"
              alt="icon"
              width={22}
              height={22}
            />
          </Link>
          <h2 className="mb-5 text-[1.75rem] leading-10.5 font-bold">{data.name}</h2>
          <div className="mb-7.5 flex items-center gap-2.5">
            <Stars
              rating={data.reviewsRating}
              size="medium"
            />
            <p className="leading-none underline decoration-1">리뷰 {data.reviewsCount}개</p>
          </div>
          <Divder className="my-7.5" />
          <div className="text-gray01 text-lg">
            <div className="flex">
              <p>판매가</p>
              <p className="text-black01 ml-22.5 font-extrabold">
                {Math.floor(data.price * (1 - data.discountRate / 100)).toLocaleString()}원
              </p>
              {data.discountRate !== 0 && (
                <p className="ml-2 font-bold line-through">{data.price.toLocaleString()}원</p>
              )}
            </div>
            <OptionSelect
              options={data.stocks}
              onSelect={handleSelect}
            >
              <div className="my-5 flex cursor-pointer justify-between py-5">
                <p>사이즈</p>
                <Image
                  src="/icon/arrowBottom.svg"
                  alt="icon"
                  width={24}
                  height={24}
                />
              </div>
            </OptionSelect>
          </div>
          <Divder className="mb-7.5" />
          <div className="min-h-36.25 space-y-2.5">
            {options.map((option) => (
              <ProductOptions
                key={option.sizeId}
                price={Math.floor(data.discountPrice)}
                option={option}
                setOptions={setOptions}
                stock={data.stocks}
              />
            ))}
          </div>
          <Divder className="my-7.5" />
          <div>
            <div className="my-7.5 flex items-center justify-between">
              <p className="text-black01 text-lg leading-none font-extrabold">총 주문 금액</p>
              <p className="text-black01 text-4xl leading-10.5 font-extrabold">
                {(data.discountPrice !== undefined && Math.floor(data.discountPrice) * totalCount).toLocaleString()}원
              </p>
            </div>
            <div className="flex justify-between gap-5">
              <Button
                className="h-21.25 w-88.75"
                variant="secondary"
                label="장바구니 담기"
                size="large"
                color="white"
                onClick={addCart}
              />
              <Button
                className="h-21.25 w-88.75"
                label="구매하기"
                size="large"
                variant="secondary"
                onClick={orderProduct}
              />
            </div>
          </div>
        </div>
      </div>
      <Divder className="my-20" />
      <h2 className="text-black01 text-[1.75rem] leading-none font-extrabold">상품 상세 정보</h2>
      <div className="mt-10">
        <ProductContent content={data.content} />
      </div>
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          <div className="flex h-fit w-130 flex-col gap-10">
            <div className="space-y-2 text-xl">
              <p className="">상품이 담겼습니다.</p>
              <p>장바구니로 이동하시겠습니까?</p>
            </div>
            <div className="flex gap-5">
              <Button
                className="h-15 w-full"
                variant="secondary"
                label="취소"
                size="large"
                color="white"
                onClick={() => setIsModalOpen(false)}
              />
              <Button
                className="h-15 w-full"
                label="이동하기"
                size="large"
                variant="secondary"
                onClick={() => router.push("/buyer/shopping")}
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ProductInfo;
