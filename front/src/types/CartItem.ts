import { ProductOption, Size } from "@/types/Product";

export type CartProductOption = ProductOption & { checked: boolean };

export type CartItem = {
  id: number;
  title: string;
  image: string;
  storename: string;
  options: CartProductOption[];
  priceMap: Record<Size, number>;
};
