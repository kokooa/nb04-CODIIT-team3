import { PrismaClient } from '@prisma/client';
import * as DashboardTypes from '../types/dashboard.js';

const prisma = new PrismaClient();

// Helper to set time to the start of the day (00:00:00.000)
const startOfDay = (date: Date) => {
    date.setHours(0, 0, 0, 0);
    return date;
};

// Helper to set time to the end of the day (23:59:59.999)
const endOfDay = (date: Date) => {
    date.setHours(23, 59, 59, 999);
    return date;
};

const getDates = (period: 'today' | 'week' | 'month' | 'year') => {
    const today = new Date();
    let startCurrent: Date, endCurrent: Date, startPrevious: Date, endPrevious: Date;

    switch (period) {
        case 'today':
            startCurrent = startOfDay(new Date(today));
            endCurrent = endOfDay(new Date(today));

            startPrevious = startOfDay(new Date(today));
            startPrevious.setDate(today.getDate() - 1);
            endPrevious = endOfDay(new Date(today));
            endPrevious.setDate(today.getDate() - 1);
            break;
        case 'week':
            const dayOfWeek = today.getDay();
            const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);

            startCurrent = startOfDay(new Date(today.getFullYear(), today.getMonth(), diffToMonday));
            endCurrent = endOfDay(new Date(today.getFullYear(), today.getMonth(), diffToMonday + 6));

            startPrevious = startOfDay(new Date(startCurrent));
            startPrevious.setDate(startCurrent.getDate() - 7);
            endPrevious = endOfDay(new Date(endCurrent));
            endPrevious.setDate(endCurrent.getDate() - 7);
            break;
        case 'month':
            startCurrent = startOfDay(new Date(today.getFullYear(), today.getMonth(), 1));
            endCurrent = endOfDay(new Date(today.getFullYear(), today.getMonth() + 1, 0));

            startPrevious = startOfDay(new Date(today.getFullYear(), today.getMonth() - 1, 1));
            endPrevious = endOfDay(new Date(today.getFullYear(), today.getMonth(), 0));
            break;
        case 'year':
            startCurrent = startOfDay(new Date(today.getFullYear(), 0, 1));
            endCurrent = endOfDay(new Date(today.getFullYear(), 11, 31));

            startPrevious = startOfDay(new Date(today.getFullYear() - 1, 0, 1));
            endPrevious = endOfDay(new Date(today.getFullYear() - 1, 11, 31));
            break;
    }
    return { startCurrent, endCurrent, startPrevious, endPrevious };
};



class DashboardService {

  private async getSalesDataForPeriod(sellerId: string, startDate: Date, endDate: Date): Promise<DashboardTypes.OrderSales> {
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

  private async getTopProducts(sellerId: string, startDate: Date, endDate: Date): Promise<DashboardTypes.TopSale[]> {
      const store = await prisma.store.findUnique({ where: { sellerId } });
      if (!store) return [];

      const rawTopProducts = await prisma.$queryRaw<Array<{productId: string, totalQuantity: BigInt}>>`
        SELECT
            oi."productId",
            SUM(oi.quantity) AS "totalQuantity"
        FROM
            "OrderItem" oi
        JOIN
            "Product" p ON oi."productId" = p.id
        JOIN
            "Order" o ON oi."orderId" = o.id
        WHERE
            p."storeId" = ${store.id} AND o."paymentDate" >= ${startDate} AND o."paymentDate" <= ${endDate} AND o.status = 'PAID'
        GROUP BY
            oi."productId"
        ORDER BY
            "totalQuantity" DESC
        LIMIT 5
      `;

      if (rawTopProducts.length === 0) return [];

      const productIds = rawTopProducts.map(p => p.productId);
      const products = await prisma.product.findMany({
          where: { id: { in: productIds } }
      });
      const productsMap = new Map(products.map(p => [p.id, p]));

      const topSales: DashboardTypes.TopSale[] = rawTopProducts.map(item => {
          const product = productsMap.get(item.productId);
          if (!product) {
              console.warn(`Product with ID ${item.productId} not found for top sales data.`);
              return null;
          }
          return {
              totalOrders: Number(item.totalQuantity),
              products: {
                  id: product.id.toString(),
                  name: product.name,
                  price: product.price,
              },
          };
      }).filter(Boolean) as DashboardTypes.TopSale[];
      
      return topSales;
  }

    private async getSalesByPriceRange(sellerId: string, startDate: Date, endDate: Date): Promise<DashboardTypes.PriceRange[]> {
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

        const rangeRevenues = new Map<string, number>();
        let totalRevenue = 0;

        priceRangesConfig.forEach(r => rangeRevenues.set(r.label, 0));

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

  public async getAggregatedDashboardData(sellerId: string): Promise<DashboardTypes.SalesData> {
    const periods: ('today' | 'week' | 'month' | 'year')[] = ['today', 'week', 'month', 'year'];
    const periodDataPromises = periods.map(async (period): Promise<[string, DashboardTypes.PeriodData]> => {
        const { startCurrent, endCurrent, startPrevious, endPrevious } = getDates(period);
        
        const [current, previous] = await Promise.all([
            this.getSalesDataForPeriod(sellerId, startCurrent, endCurrent),
            this.getSalesDataForPeriod(sellerId, startPrevious, endPrevious)
        ]);

        const changeRate: DashboardTypes.ChangeRate = {
            totalOrders: previous.totalOrders === 0 ? (current.totalOrders > 0 ? 100 : 0) : parseFloat((((current.totalOrders - previous.totalOrders) / previous.totalOrders) * 100).toFixed(2)),
            totalSales: previous.totalSales === 0 ? (current.totalSales > 0 ? 100 : 0) : parseFloat((((current.totalSales - previous.totalSales) / previous.totalSales) * 100).toFixed(2)),
        };

        return [period, { current, previous, changeRate }];
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