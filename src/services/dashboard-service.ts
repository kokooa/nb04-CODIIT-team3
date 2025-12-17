import { PrismaClient } from '@prisma/client';
import * as DashboardTypes from '../types/dashboard.js';

const prisma = new PrismaClient();

const getDates = (period: 'today' | 'week' | 'month' | 'year') => {
    const today = new Date();
    let startCurrent: Date, endCurrent: Date, startPrevious: Date, endPrevious: Date;

    switch (period) {
        case 'today':
            startCurrent = new Date(today);
            startCurrent.setHours(0, 0, 0, 0);
            endCurrent = new Date(today);
            endCurrent.setHours(23, 59, 59, 999);

            startPrevious = new Date(startCurrent);
            startPrevious.setDate(startCurrent.getDate() - 1);
            endPrevious = new Date(endCurrent);
            endPrevious.setDate(endCurrent.getDate() - 1);
            break;
        case 'week':
            const dayOfWeek = today.getDay(); // Sunday - 0, Monday - 1, ..., Saturday - 6
            const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to get to Monday

            startCurrent = new Date(today.getFullYear(), today.getMonth(), diffToMonday);
            startCurrent.setHours(0, 0, 0, 0);

            endCurrent = new Date(today.getFullYear(), today.getMonth(), diffToMonday + 6);
            endCurrent.setHours(23, 59, 59, 999);

            startPrevious = new Date(startCurrent);
            startPrevious.setDate(startCurrent.getDate() - 7);
            endPrevious = new Date(endCurrent);
            endPrevious.setDate(endCurrent.getDate() - 7);
            break;
        case 'month':
            startCurrent = new Date(today.getFullYear(), today.getMonth(), 1);
            endCurrent = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

            startPrevious = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            endPrevious = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
            break;
        case 'year':
            startCurrent = new Date(today.getFullYear(), 0, 1);
            endCurrent = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);

            startPrevious = new Date(today.getFullYear() - 1, 0, 1);
            endPrevious = new Date(today.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
            break;
    }
    return { startCurrent, endCurrent, startPrevious, endPrevious };
};


class DashboardService {

  private async getSalesDataForPeriod(sellerId: number, startDate: Date, endDate: Date): Promise<DashboardTypes.OrderSales> {
      const store = await prisma.store.findUnique({ where: { sellerId } });
      if (!store) return { totalOrders: 0, totalSales: 0 };

      const orderItems = await prisma.orderItem.findMany({
          where: {
              product: { storeId: store.id },
              order: { paymentDate: { gte: startDate, lte: endDate }, status: 'PAID' },
          },
      });

      if (orderItems.length === 0) return { totalOrders: 0, totalSales: 0 };

      const totalSales = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const totalOrders = new Set(orderItems.map(item => item.orderId)).size;

      return { totalOrders, totalSales };
  }

  private async getTopProducts(sellerId: number, startDate: Date, endDate: Date): Promise<DashboardTypes.TopSale[]> {
      const store = await prisma.store.findUnique({ where: { sellerId } });
      if (!store) return [];

      const topProductsData = await prisma.orderItem.groupBy({
          by: ['productId'],
          where: {
              product: { storeId: store.id },
              order: { paymentDate: { gte: startDate, lte: endDate }, status: 'PAID' },
          },
          _sum: { quantity: true },
          orderBy: { _sum: { quantity: 'desc' } },
          take: 5,
      });
      
      if (topProductsData.length === 0) return [];

      const products = await prisma.product.findMany({
          where: { id: { in: topProductsData.map(p => p.productId) } }
      });
      const productsMap = new Map(products.map(p => [p.id, p]));

      const topSales: DashboardTypes.TopSale[] = topProductsData.map(item => {
          const product = productsMap.get(item.productId);
          if (!product) { // Add this check
              console.warn(`Product with ID ${item.productId} not found for top sales data.`);
              return null; // Skip this item or handle as needed
          }
          return {
              totalOrders: item._sum.quantity || 0,
              prodcuts: {
                  id: product.id.toString(),
                  name: product.name,
                  price: product.price,
              },
          };
      }).filter(Boolean) as DashboardTypes.TopSale[]; // Filter out nulls
      return topSales;
  }

    private async getSalesByPriceRange(sellerId: number, startDate: Date, endDate: Date): Promise<DashboardTypes.PriceRange[]> {
        const store = await prisma.store.findUnique({ where: { sellerId } });
        if (!store) return [];

        const orderItems = await prisma.orderItem.findMany({
            where: {
                product: { storeId: store.id },
                order: { paymentDate: { gte: startDate, lte: endDate }, status: 'PAID' },
            },
        });
        
        const priceRangesConfig = [
            { label: '~ 1만원', min: 0, max: 10000 },
            { label: '1만원 ~ 3만원', min: 10001, max: 30000 },
            { label: '3만원 ~ 5만원', min: 30001, max: 50000 },
            { label: '5만원 ~ 10만원', min: 50001, max: 100000 },
            { label: '10만원 ~', min: 100001, max: Infinity },
        ];

        const rangeRevenues = new Map<string, number>(priceRangesConfig.map(r => [r.label, 0]));
        let totalRevenue = 0;

        for (const item of orderItems) {
            const revenue = item.price * item.quantity;
            totalRevenue += revenue;
            const range = priceRangesConfig.find(r => item.price >= r.min && item.price <= r.max);
            if (range) {
                rangeRevenues.set(range.label, (rangeRevenues.get(range.label) || 0) + revenue);
            }
        }
        
        if (totalRevenue === 0) {
            return priceRangesConfig.map(r => ({ priceRange: r.label, totalSales: 0, percentage: 0 }));
        }
        
        return priceRangesConfig.map(r => {
            const revenue = rangeRevenues.get(r.label) || 0;
            return {
                priceRange: r.label,
                totalSales: revenue,
                percentage: parseFloat(((revenue / totalRevenue) * 100).toFixed(2)),
            };
        });
    }

  public async getAggregatedDashboardData(sellerId: number): Promise<DashboardTypes.SalesData> {
    const periods: ('today' | 'week' | 'month' | 'year')[] = ['today', 'week', 'month', 'year'];
    const periodDataPromises = periods.map(async (period): Promise<[string, DashboardTypes.PeriodData]> => {
        const { startCurrent, endCurrent, startPrevious, endPrevious } = getDates(period);
        
        const [current, previous] = await Promise.all([
            this.getSalesDataForPeriod(sellerId, startCurrent, endCurrent),
            this.getSalesDataForPeriod(sellerId, startPrevious, endPrevious)
        ]);

        const chageRate: DashboardTypes.ChangeRate = {
            totalOrders: previous.totalOrders === 0 ? (current.totalOrders > 0 ? 100 : 0) : parseFloat((((current.totalOrders - previous.totalOrders) / previous.totalOrders) * 100).toFixed(2)),
            totalSales: previous.totalSales === 0 ? (current.totalSales > 0 ? 100 : 0) : parseFloat((((current.totalSales - previous.totalSales) / previous.totalSales) * 100).toFixed(2)),
        };

        return [period, { current, previous, chageRate }];
    });
    
    const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30));
    const now = new Date();

    const [
        periodResults,
        topSales,
        priceRange
    ] = await Promise.all([
        Promise.all(periodDataPromises),
        this.getTopProducts(sellerId, thirtyDaysAgo, now),
        this.getSalesByPriceRange(sellerId, thirtyDaysAgo, now)
    ]);

    const periodDataObject = Object.fromEntries(periodResults);

    return {
        today: periodDataObject.today!,
        week: periodDataObject.week!,
        month: periodDataObject.month!,
        year: periodDataObject.year!,
        topSales,
        priceRange,
    };
  }
}

export const dashboardService = new DashboardService();