// src/services/dashboard-service.ts
import { PrismaClient, Product } from '@prisma/client';
import { SalesData, PeriodData, OrderSales, TopSale, PriceRange, ChangeRate } from 'project-codiit-fe-main/src/types/dashboard'; // Assuming types can be imported like this

const prisma = new PrismaClient();

// Helper to get start/end dates for various periods
const getDates = (period: 'today' | 'week' | 'month' | 'year') => {
    const now = new Date();
    let startCurrent: Date, endCurrent: Date, startPrevious: Date, endPrevious: Date;

    switch (period) {
        case 'today':
            startCurrent = new Date(now.setHours(0, 0, 0, 0));
            endCurrent = new Date(now.setHours(23, 59, 59, 999));
            startPrevious = new Date(new Date().setDate(startCurrent.getDate() - 1));
            endPrevious = new Date(new Date().setDate(endCurrent.getDate() - 1));
            break;
        case 'week':
            const firstDayOfWeek = now.getDate() - now.getDay();
            startCurrent = new Date(new Date(now.setDate(firstDayOfWeek)).setHours(0, 0, 0, 0));
            endCurrent = new Date(new Date(now.setDate(startCurrent.getDate() + 6)).setHours(23, 59, 59, 999));
            startPrevious = new Date(new Date().setDate(startCurrent.getDate() - 7));
            endPrevious = new Date(new Date().setDate(endCurrent.getDate() - 7));
            break;
        case 'month':
            startCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
            endCurrent = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            startPrevious = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endPrevious = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
            break;
        case 'year':
            startCurrent = new Date(now.getFullYear(), 0, 1);
            endCurrent = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
            startPrevious = new Date(now.getFullYear() - 1, 0, 1);
            endPrevious = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
            break;
    }
    return { startCurrent, endCurrent, startPrevious, endPrevious };
};


class DashboardService {

  // Reusable function to get sales data for a specific period
  private async getSalesDataForPeriod(sellerId: number, startDate: Date, endDate: Date): Promise<OrderSales> {
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

  // Function to get Top 5 Products, formatted for the frontend
  private async getTopProducts(sellerId: number, startDate: Date, endDate: Date): Promise<TopSale[]> {
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

      const topSales: TopSale[] = topProductsData.map(item => {
          const product = productsMap.get(item.productId)!;
          return {
              totalOrders: item._sum.quantity || 0,
              prodcuts: { // Note: 'prodcuts' is a typo in the frontend type, matching it here.
                  id: product.id.toString(),
                  name: product.name,
                  price: product.price,
              },
          };
      });
      return topSales;
  }

    // Function to get sales by price range, formatted for the frontend
    private async getSalesByPriceRange(sellerId: number, startDate: Date, endDate: Date): Promise<PriceRange[]> {
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


  // Main function to aggregate all dashboard data
  public async getAggregatedDashboardData(sellerId: number): Promise<SalesData> {
    const periods: ('today' | 'week' | 'month' | 'year')[] = ['today', 'week', 'month', 'year'];
    const periodDataPromises = periods.map(async (period): Promise<[string, PeriodData]> => {
        const { startCurrent, endCurrent, startPrevious, endPrevious } = getDates(period);
        
        const [current, previous] = await Promise.all([
            this.getSalesDataForPeriod(sellerId, startCurrent, endCurrent),
            this.getSalesDataForPeriod(sellerId, startPrevious, endPrevious)
        ]);

        const chageRate: ChangeRate = { // Typo 'chageRate' matches frontend type
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
        this.getTopProducts(sellerId, thirtyDaysAgo, now), // Use last 30 days
        this.getSalesByPriceRange(sellerId, thirtyDaysAgo, now) // Use last 30 days
    ]);

    const periodDataObject = Object.fromEntries(periodResults);

    return {
        today: periodDataObject.today,
        week: periodDataObject.week,
        month: periodDataObject.month,
        year: periodDataObject.year,
        topSales,
        priceRange,
    };
  }
}

export const dashboardService = new DashboardService();