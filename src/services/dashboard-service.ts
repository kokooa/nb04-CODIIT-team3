// src/services/dashboard-service.ts
import { PrismaClient, Product } from '@prisma/client';

const prisma = new PrismaClient();

interface SalesSummary {
  salesCount: number;
  totalRevenue: number;
}

interface TopProduct extends Product {
  salesCount: number;
}

interface SalesByPriceRange {
  range: string;
  revenue: number;
  percentage: number;
}

class DashboardService {
  // 1. 기간별 판매 건수와 판매 금액
  async getSalesSummary(sellerId: number, startDate: Date, endDate: Date): Promise<SalesSummary> {
    const store = await prisma.store.findUnique({
      where: { sellerId },
    });

    if (!store) {
      return { salesCount: 0, totalRevenue: 0 };
    }

    const orderItems = await prisma.orderItem.findMany({
      where: {
        product: {
          storeId: store.id,
        },
        order: {
          paymentDate: {
            gte: startDate,
            lte: endDate,
          },
          status: 'PAID', // 결제 완료된 주문만 집계
        },
      },
      include: {
        order: true,
      },
    });

    if (orderItems.length === 0) {
      return { salesCount: 0, totalRevenue: 0 };
    }

    const totalRevenue = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const salesCount = new Set(orderItems.map(item => item.orderId)).size;

    return { salesCount, totalRevenue };
  }

  // 2. 많이 판매된 상품 TOP 5
  async getTopProducts(sellerId: number, startDate: Date, endDate: Date): Promise<TopProduct[]> {
    const store = await prisma.store.findUnique({
      where: { sellerId },
    });

    if (!store) {
      return [];
    }

    const topProductsData = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        product: {
          storeId: store.id,
        },
        order: {
          paymentDate: {
            gte: startDate,
            lte: endDate,
          },
          status: 'PAID',
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    if (topProductsData.length === 0) {
      return [];
    }
    
    const productIds = topProductsData.map(item => item.productId);

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    const productsMap = new Map(products.map(p => [p.id, p]));

    const topProducts: TopProduct[] = topProductsData.map(item => {
      const product = productsMap.get(item.productId)!;
      return {
        ...product,
        salesCount: item._sum.quantity || 0,
      };
    });
    
    // 원래 순서대로 정렬
    topProducts.sort((a,b) => b.salesCount - a.salesCount);

    return topProducts;
  }

  // 3. 가격대별 매출 비중
  async getSalesByPriceRange(sellerId: number, startDate: Date, endDate: Date): Promise<SalesByPriceRange[]> {
    const store = await prisma.store.findUnique({
      where: { sellerId },
    });

    if (!store) {
      return [];
    }

    const orderItems = await prisma.orderItem.findMany({
      where: {
        product: {
          storeId: store.id,
        },
        order: {
          paymentDate: {
            gte: startDate,
            lte: endDate,
          },
          status: 'PAID',
        },
      },
    });

    if (orderItems.length === 0) {
        return [];
    }

    const priceRanges = [
      { label: '~ 1만원', min: 0, max: 10000 },
      { label: '1만원 ~ 3만원', min: 10001, max: 30000 },
      { label: '3만원 ~ 5만원', min: 30001, max: 50000 },
      { label: '5만원 ~ 10만원', min: 50001, max: 100000 },
      { label: '10만원 ~', min: 100001, max: Infinity },
    ];

    const rangeRevenues = new Map<string, number>(priceRanges.map(r => [r.label, 0]));
    let totalRevenue = 0;
    
    for (const item of orderItems) {
      const revenue = item.price * item.quantity;
      totalRevenue += revenue;
      const range = priceRanges.find(r => item.price >= r.min && item.price <= r.max);
      if (range) {
        rangeRevenues.set(range.label, (rangeRevenues.get(range.label) || 0) + revenue);
      }
    }
    
    if (totalRevenue === 0) {
        return priceRanges.map(range => ({
            range: range.label,
            revenue: 0,
            percentage: 0
        }));
    }

    const result: SalesByPriceRange[] = priceRanges.map(range => {
      const revenue = rangeRevenues.get(range.label) || 0;
      return {
        range: range.label,
        revenue: revenue,
        percentage: parseFloat(((revenue / totalRevenue) * 100).toFixed(2)),
      };
    });

    return result;
  }
}

export const dashboardService = new DashboardService();
