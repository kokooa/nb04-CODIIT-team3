import { PrismaClient, OrderStatus } from '@prisma/client';
import { NotificationService } from './notification-service.js';

const prisma = new PrismaClient();
// NotificationService 인스턴스 생성
const notificationService = new NotificationService();

export const PurchaseService = {
  async createOrder(userId: string, orderData: any) {
    const { items, usePoints, recipientName, recipientPhone, deliveryAddress } =
      orderData;

    return await prisma.$transaction(async tx => {
      let totalAmount = 0;

      for (const item of items) {
        // 1. 재고 체크
        const stock = await tx.productStock.findUnique({
          where: {
            productId_size: { productId: item.productId, size: item.size },
          },
        });

        if (!stock || stock.quantity < item.quantity) {
          throw new Error(`재고 부족: ${item.productId}`);
        }

        // 2. 재고 차감
        const updatedStock = await tx.productStock.update({
          where: { id: stock.id },
          data: { quantity: { decrement: item.quantity } },
        });

        // 3. 품절 시 알림 생성
        if (updatedStock.quantity === 0) {
          // 인스턴스를 사용하고, 정의된 메서드 형식에 맞춰 호출합니다.
          // notification-service.ts에 작성한 메서드와 일치시킵니다.
          await notificationService.createOrderNotification(
            userId,
            `품절된 상품 ID: ${item.productId}`,
          );
        }

        totalAmount += item.price * item.quantity;
      }

      // 4. 주문 생성
      const order = await tx.order.create({
        data: {
          userId,
          orderNumber: `ORD-${Date.now()}`,
          totalAmount: totalAmount - usePoints,
          usedPoints: usePoints,
          status: OrderStatus.PAID,
          recipientName,
          recipientPhone,
          deliveryAddress,
          orderItems: {
            create: items.map((i: any) => ({
              productId: i.productId,
              quantity: i.quantity,
              price: i.price,
              size: i.size,
            })),
          },
        },
      });

      // 5. 장바구니 비우기
      await tx.cartItem.deleteMany({ where: { userId } });

      return order;
    });
  },
};
