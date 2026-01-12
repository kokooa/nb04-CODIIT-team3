interface PayloadData {
  productName: string;
  totalOrders: number;
  totalPrice: number;
}

export interface CustomPayloadEntry {
  value: string;
  color: string;
  payload: PayloadData;
}

// 주문량
export interface OrderSales {
  totalOrders: number;
  totalSales: number;
}

// 이전 대비 비율
export interface ChangeRate {
  totalOrders: number;
  totalSales: number;
}

// 기간별 판매 데이터
export interface PeriodData {
  current: OrderSales;
  previous: OrderSales | null;
  changeRate: ChangeRate;
}

// 상품 구조 정보
interface Product {
  id: string;
  name: string;
  price: number;
}

// 가장 많이 팔린상품 정보
export interface TopSale {
  totalOrders: number;
  product: Product;
}

// 가격 구간별 매출 통계
export interface PriceRange {
  priceRange: string;
  totalSales: number;
  percentage: number;
}

// 전체 판매 데이터
export interface SalesData {
  today: PeriodData;
  week: PeriodData;
  month: PeriodData;
  year: PeriodData;
  topSales: TopSale[];
  priceRange: PriceRange[];
}
