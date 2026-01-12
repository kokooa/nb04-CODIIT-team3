"use client";

import Image from "next/image";

interface CountButtonProps {
  count: number;
  onChange: (quantity: number) => void;
}

const ShoppingCountButton = ({ count, onChange }: CountButtonProps) => {
  const onMinus = (): void => {
    if (count <= 1) return;
    onChange(count - 1);
  };

  const onPlus = (): void => {
    onChange(count + 1);
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
      <p className="flex size-11.25 items-center justify-center leading-none">{count}</p>
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

export default ShoppingCountButton;
