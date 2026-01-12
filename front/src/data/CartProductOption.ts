import { CartItem } from "@/types/CartItem";

export const DUMMY_CART: CartItem[] = [
  {
    id: 1,
    title: "데일리 골지 니트 아이보리 1color [컬러]카멜/카키/브라운/슬림핏/터치소프트/슬림핏/기모/라운드넥/데일리",
    image: "/images/Mask-group.svg",
    storename: "데일리무드",
    options: [
      { size: "M", count: 1, checked: true },
      { size: "S", count: 1, checked: true },
    ],
    priceMap: { M: 34000, S: 34000, L: 0, XL: 0, XS: 0, Free: 0 },
  },
  {
    id: 2,
    title: "하이웨스트 일자 바지 2colors 3가지 기장",
    image: "/images/Mask-group.svg",
    storename: "룰루걸즈",
    options: [{ size: "M", count: 2, checked: true }],
    priceMap: { M: 36200, S: 0, L: 0, XL: 0, XS: 0, Free: 0 },
  },
];
