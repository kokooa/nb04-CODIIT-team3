"use client";

import { useToaster } from "@/proviers/toaster/toaster.hook";
import { CartEditSize } from "@/types/cart";
import Image from "next/image";
import { SetStateAction } from "react";

interface CountButtonProps {
  option: CartEditSize;
  setOptions: React.Dispatch<SetStateAction<CartEditSize[]>>;
  quantity?: number;
}

const CountButton = ({ option, setOptions, quantity = 0 }: CountButtonProps) => {
  const toaster = useToaster();

  const onMinus = (): void => {
    if (option.quantity <= 1) return;
    setOptions((prev) =>
      prev.map((item) => (item.sizeId === option.sizeId ? { ...item, quantity: option.quantity - 1 } : item))
    );
  };

  const onPlus = (): void => {
    if (option.quantity >= quantity) {
      toaster("warn", "선택 가능한 수량을 초과했습니다.");
      return;
    }
    setOptions((prev) =>
      prev.map((item) => (item.sizeId === option.sizeId ? { ...item, quantity: option.quantity + 1 } : item))
    );
  };

  return (
    <div className="border-gray03 flex rounded-md border bg-white">
      <button
        className="flex size-11.25 justify-center"
        onClick={onMinus}
      >
        <Image
          src="/icon/minus.svg"
          alt="icon"
          width={12}
          height={12}
        />
      </button>
      <p className="flex size-11.25 items-center justify-center leading-none">{option.quantity}</p>
      <button
        className="flex size-11.25 justify-center"
        onClick={onPlus}
      >
        <Image
          src="/icon/plus.svg"
          alt="icon"
          width={12}
          height={12}
        />
      </button>
    </div>
  );
};

export default CountButton;
