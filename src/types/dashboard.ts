// This file defines the data structures for the dashboard API response,
// ensuring consistency between the backend and the frontend.

// 주문량 및 매출
export interface OrderSales {
  totalOrders: number;
  totalSales: number;
}

// 이전 대비 변화율
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
interface ProductInfo {
  id: string;
  name: string;
  price: number;
}

// 가장 많이 팔린 상품 정보
export interface TopSale {
  totalOrders: number;
  products: ProductInfo;
}

// 가격 구간별 매출 통계
export interface PriceRange {
  priceRange: string;
  totalSales: number;
  percentage: number;
}

// 전체 대시보드 데이터
export interface SalesData {
  today: PeriodData;
  week: PeriodData;
  month: PeriodData;
  year: PeriodData;
  topSales: TopSale[];
  priceRange: PriceRange[];
}
