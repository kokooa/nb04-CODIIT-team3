import { PrismaClient } from '@prisma/client';

class SellerServiceClass {
  private prisma = new PrismaClient();

  async getDashboard(userId: string) {
    // 1. 내 스토어 찾기
    const store = await this.prisma.store.findUnique({
      where: { sellerId: userId },
      include: { products: true }, // 상품 정보 필요
    });

    if (!store) {
      // 스토어가 없으면 빈 데이터 리턴
      return {
        pieChartData: [],
        barChartData: [],
        totalSales: 0,
        totalOrders: 0,
      };
    }

    // 2. 내 스토어의 주문 아이템들 조회 (Order -> OrderItem -> Product.storeId 체크)
    // Prisma는 역방향 조회가 까다로우므로, 내 상품 ID 목록으로 주문된 아이템을 찾습니다.
    const productIds = store.products.map(p => p.id);

    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        productId: { in: productIds },
      },
      include: {
        product: true, // 카테고리 정보를 위해 포함
      },
    });

    // 3. [PieChart용] 카테고리별 판매 수량 집계
    const categoryStats: { [key: string]: number } = {};

    orderItems.forEach(item => {
      // Product 모델의 category Enum 값 사용 (예: 'TOP', 'BOTTOM')
      const category = item.product.category;
      if (!categoryStats[category]) {
        categoryStats[category] = 0;
      }
      categoryStats[category] += item.quantity;
    });

    // ✅ [핵심 수정] 프론트엔드가 원하는 포맷({ id, name, value })으로 변환
    const pieChartData = Object.keys(categoryStats).map((category, index) => ({
      id: category, // 고유 ID로 카테고리명 사용
      name: category, // 화면에 표시될 이름
      value: categoryStats[category], // 값
    }));

    // 데이터가 아예 없으면 빈 배열 대신 "데이터 없음" 표시용 더미 데이터 주거나 빈 배열 유지
    // (여기서는 빈 배열 리턴)

    return {
      // ... 다른 통계 데이터들 (총 매출 등)
      pieChartData,
    };
  }
}

export const SellerService = new SellerServiceClass();
