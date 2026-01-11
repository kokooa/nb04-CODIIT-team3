import { BuyerOrderItem } from "./buyerPurchase";

export type MypagePurchase = BuyerOrderItem;

export interface Purchase {
  id: number;
  image: string;
  title: string;
  date: string;
  size: string;
  price: number;
  count: number;
  button: {
    label: string;
    variant: "primary" | "secondary" | "selected";
    color: "black" | "white";
  };
  rating?: number;
  reviewer?: string;
  reviewDate?: string;
  reviewContent?: string;
}
