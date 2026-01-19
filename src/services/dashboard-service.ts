import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ... (날짜 헬퍼 함수들은 그대로 유지) ...
const startOfDay = (date: Date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

const endOfDay = (date: Date) => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

const getDates = (period: 'today' | 'week' | 'month' | 'year') => {
  const today = new Date();
  let startCurrent: Date,
    endCurrent: Date,
    startPrevious: Date,
    endPrevious: Date;

  switch (period) {
    case 'today':
      startCurrent = startOfDay(today);
      endCurrent = endOfDay(today);
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      startPrevious = startOfDay(yesterday);
      endPrevious = endOfDay(yesterday);
      break;
    case 'week':
      const dayOfWeek = today.getDay();
      const diffToMonday =
        today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      startCurrent = startOfDay(
        new Date(today.getFullYear(), today.getMonth(), diffToMonday),
      );
      endCurrent = endOfDay(
        new Date(today.getFullYear(), today.getMonth(), diffToMonday + 6),
      );
      startPrevious = new Date(startCurrent);
      startPrevious.setDate(startCurrent.getDate() - 7);
      endPrevious = new Date(endCurrent);
      endPrevious.setDate(endCurrent.getDate() - 7);
      break;
    case 'month':
      startCurrent = startOfDay(
        new Date(today.getFullYear(), today.getMonth(), 1),
      );
      endCurrent = endOfDay(
        new Date(today.getFullYear(), today.getMonth() + 1, 0),
      );
      startPrevious = startOfDay(
        new Date(today.getFullYear(), today.getMonth() - 1, 1),
      );
      endPrevious = endOfDay(
        new Date(today.getFullYear(), today.getMonth(), 0),
      );
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

// ✅ [수정] 클래스 이름을 'DashboardServiceClass'로 변경 (충돌 방지)
class DashboardServiceClass {
  private async getSalesDataForPeriod(
    sellerId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const store = await prisma.store.findUnique({ where: { sellerId } });
    if (!store) return { totalOrders: 0, totalSales: 0 };

    const orderItems = await prisma.orderItem.findMany({
      where: {
        product: { storeId: store.id },
        order: {
          paymentDate: { gte: startDate, lte: endDate },
          status: 'PAID',
        },
      },
    });

    if (orderItems.length === 0) return { totalOrders: 0, totalSales: 0 };

    const totalSales = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const totalOrders = new Set(orderItems.map(item => item.orderId)).size;

    return { totalOrders, totalSales };
  }

  // [Top Sales]
  private async getTopProducts(
    sellerId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const store = await prisma.store.findUnique({ where: { sellerId } });
    if (!store) return [];

    const rawTopProducts = await prisma.$queryRaw<
      Array<{ productId: string; totalQuantity: bigint }>
    >`
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
            p."storeId" = ${store.id} 
            AND o."paymentDate" >= ${startDate} 
            AND o."paymentDate" <= ${endDate} 
            AND o.status = 'PAID'
        GROUP BY
            oi."productId"
        ORDER BY
            "totalQuantity" DESC
        LIMIT 5
      `;

    if (!rawTopProducts || rawTopProducts.length === 0) return [];

    const productIds = rawTopProducts.map(p => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productsMap = new Map(products.map(p => [p.id, p]));

    return rawTopProducts
      .map(item => {
        const product = productsMap.get(item.productId);
        if (!product) return null;

        return {
          id: product.id,
          totalOrders: Number(item.totalQuantity),
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
          },
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }

  // [Price Range]
  private async getSalesByPriceRange(
    sellerId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const store = await prisma.store.findUnique({ where: { sellerId } });
    if (!store) return [];

    const orderItems = await prisma.orderItem.findMany({
      where: {
        product: { storeId: store.id },
        order: {
          paymentDate: { gte: startDate, lte: endDate },
          status: 'PAID',
        },
      },
    });

    const priceRangesConfig = [
      { label: '만원 이하', min: 0, max: 10000 },
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
      const range = priceRangesConfig.find(
        r => item.price >= r.min && item.price <= r.max,
      );
      if (range) {
        rangeRevenues.set(
          range.label,
          (rangeRevenues.get(range.label) || 0) + revenue,
        );
      }
    }

    return priceRangesConfig.map(r => {
      const revenue = rangeRevenues.get(r.label) || 0;
      return {
        id: r.label,
        name: r.label,
        priceRange: r.label,
        totalSales: revenue,
        percentage:
          totalRevenue === 0
            ? 0
            : parseFloat(((revenue / totalRevenue) * 100).toFixed(1)),
      };
    });
  }

  // [Main]
  public async getAggregatedDashboardData(sellerId: string) {
    const periods = ['today', 'week', 'month', 'year'] as const;

    const periodDataPromises = periods.map(async period => {
      const { startCurrent, endCurrent, startPrevious, endPrevious } =
        getDates(period);

      const [current, previous] = await Promise.all([
        this.getSalesDataForPeriod(sellerId, startCurrent, endCurrent),
        this.getSalesDataForPeriod(sellerId, startPrevious, endPrevious),
      ]);

      const calculateChange = (curr: number, prev: number) => {
        if (prev === 0) return curr > 0 ? 100 : 0;
        return parseFloat((((curr - prev) / prev) * 100).toFixed(1));
      };

      const changeRate = {
        totalOrders: calculateChange(current.totalOrders, previous.totalOrders),
        totalSales: calculateChange(current.totalSales, previous.totalSales),
      };

      return [period, { current, previous, changeRate }];
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    startOfDay(thirtyDaysAgo);
    const now = new Date();

    const [periodResults, topSales, priceRange] = await Promise.all([
      Promise.all(periodDataPromises),
      this.getTopProducts(sellerId, thirtyDaysAgo, now),
      this.getSalesByPriceRange(sellerId, thirtyDaysAgo, now),
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

// ✅ [수정] 클래스를 생성하여 'DashboardService'라는 이름으로 내보냄
export const DashboardService = new DashboardServiceClass();
