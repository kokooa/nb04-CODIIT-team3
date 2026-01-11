import CountButton from "@/components/button/CountButton";
import { Stock } from "@/types/Product";
import { CartEditSize } from "@/types/cart";
import Image from "next/image";
import { SetStateAction } from "react";

interface ProductOptionsProps {
  option: CartEditSize;
  price: number | undefined;
  setOptions: React.Dispatch<SetStateAction<CartEditSize[]>>;
  stock?: Stock[];
}

const ProductOptions = ({ option, price = 0, setOptions, stock }: ProductOptionsProps) => {
  const targetSize = stock?.find((i) => i.size.id === option.sizeId);

  const deleteOption = () => {
    setOptions((prev) => prev.filter((item) => !(item.sizeId === option.sizeId)));
  };

  return (
    <div className="bg-gray05 relative h-36.25 space-y-5 rounded-xl p-7.5">
      <p className="text-lg leading-none">{targetSize?.size.name}</p>
      <button
        className="top absolute top-3 right-3"
        onClick={deleteOption}
      >
        <Image
          src="/icon/delete.svg"
          alt="icon"
          width={24}
          height={24}
        />
      </button>
      <div className="flex items-center justify-between">
        <CountButton
          option={option}
          setOptions={setOptions}
          quantity={targetSize?.quantity}
        />
        <p className="text-[1.375rem] leading-none font-extrabold">{price.toLocaleString()}원</p>
      </div>
    </div>
  );
};

export default ProductOptions;
