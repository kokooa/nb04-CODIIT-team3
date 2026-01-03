export interface StockDto {
  size: string;
  quantity: number;
}

export interface CreateProductDto {
  name: string;
  price: number;
  content?: string;
  image?: string;
  discountRate?: number;
  discountStartTime?: string;
  discountEndTime?: string;
  categoryName: string;
  stocks: StockDto[];
}

export interface UpdateProductDto {
  name?: string;
  price?: number;
  content?: string;
  image?: string;
  discountRate?: number;
  discountStartTime?: string;
  discountEndTime?: string;
  categoryName?: string;
  isSoldOut?: boolean;
  stocks?: StockDto[];
}

export interface ProductQueryDto {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  priceMin?: number;
  priceMax?: number;
  size?: string;
  favoriteStore?: string;
  categoryName?: string;
}