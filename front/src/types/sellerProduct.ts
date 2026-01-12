export interface MyProduct {
  id: string;
  image: string;
  name: string;
  price: number;
  createdAt: string;
  stock: number;
  isDiscount: boolean;
  isSoldOut: boolean;
}

export interface MyProductsResponse {
  list: MyProduct[];
  totalCount: number;
}
