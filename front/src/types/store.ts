export interface Store {
  id: string;
  userId: string;
  name: string;
  address: string;
  detailAddress?: string;
  phoneNumber: string;
  content: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  favoriteCount?: number;
}

export interface StoreLike {
  storeId: string;
  userId: string;
  store: Store;
}

export interface StoreDetailResponse extends Store {
  productCount: number;
  favoriteCount: number;
  monthFavoriteCount: number;
  totalSoldCount: number;
}

export interface FavoriteStores {
  store: Store;
}
