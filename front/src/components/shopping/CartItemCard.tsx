import { CartItem } from "@/types/cart";
import Image from "next/image";
import ShoppingCountButton from "../button/ShoppintCountButton";
import { ProductInfoData } from "@/types/Product";

// sizeId에 따른 사이즈 매핑
const getSizeLabel = (sizeId: number): string => {
  switch (sizeId) {
    case 1:
      return "XS";
    case 2:
      return "S";
    case 3:
      return "M";
    case 4:
      return "L";
    case 5:
      return "XL";
    case 6:
      return "Free";
    default:
      return "Unknown";
  }
};

interface CartItemCardProps {
  item: CartItem;
  isChecked: boolean;
  onCheck: () => void;
  onQuantityChange: (quantity: number) => void;
  onDelete: () => void;
}

export default function CartItemCard({ item, isChecked, onCheck, onQuantityChange, onDelete }: CartItemCardProps) {
  const discountedPrice = Math.floor((item.product as ProductInfoData).discountPrice ?? item.product.price * (1 - item.product.discountRate / 100));
  const totalPrice = discountedPrice * item.quantity;

  return (
    <div className="border-gray03 relative rounded-2xl border bg-white p-7.5">
      <div className="flex items-center gap-7.5">
        <Image
          src="/icon_check.svg"
          alt="check"
          width={32}
          height={32}
          className={`cursor-pointer text-white ${isChecked ? "" : "opacity-20"}`}
          onClick={onCheck}
        />
        <div className="relative h-45 w-45">
          <Image
            src={item.product.image}
            alt={item.product.name}
            fill
            className="rounded-xl object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col gap-5">
          <div className="flex flex-col gap-2.5">
            <div className="text-gray01 text-lg font-normal">{item.product.store?.name}</div>
            <div className="text-black01 text-lg font-bold">{item.product.name}</div>
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="bg-gray05 rounded-md px-5 py-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-[4.75rem]">
                  <div className="flex items-center gap-5">
                    <p className="text-black01 text-base font-normal">사이즈 : {getSizeLabel(item.sizeId)}</p>
                  </div>
                  <ShoppingCountButton
                    count={item.quantity}
                    onChange={onQuantityChange}
                  />
                </div>
                <div className="flex flex-col items-end gap-2">
                  {item.product.discountRate > 0 && (
                    <div className="flex items-center gap-4">
                      <p className="text-gray01 text-base line-through">{item.product.price.toLocaleString()}원</p>
                      <p className="text-red01 text-base font-bold">{item.product.discountRate}% 할인</p>
                    </div>
                  )}
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-lg font-extrabold">{discountedPrice.toLocaleString()}원</p>
                    <p className="text-black01 text-base">총 {totalPrice.toLocaleString()}원</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button
        className="absolute top-5 right-5"
        onClick={onDelete}
      >
        <Image
          src="/icon/delete.svg"
          alt="삭제"
          width={24}
          height={24}
        />
      </button>
    </div>
  );
}
