import { PrismaClient, OrderStatus } from '@prisma/client';
import { NotificationService } from './notification-service.js';

const prisma = new PrismaClient();

export const PurchaseService = {
  async createOrder(userId: string, data: any) {
    const {
      items, // [{productId, size, quantity}]
      usePoints,
      recipientName,
      recipientPhone,
      deliveryAddress,
    } = data;

    return await prisma.$transaction(async tx => {
      let totalAmount = 0;

      // 1. 재고 확인 및 상품 정보 취득
      for (const item of items) {
        const stock = await tx.productStock.findUnique({
          where: {
            productId_size: { productId: item.productId, size: item.size },
          },
        });

        if (!stock || stock.quantity < item.quantity) {
          throw new Error(
            `[품절] 상품 ID: ${item.productId} (사이즈: ${item.size})의 재고가 부족합니다.`,
          );
        }

        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });
        totalAmount += (product?.price || 0) * item.quantity;

        // 2. 재고 차감 및 품절 알림 트리거
        const updatedStock = await tx.productStock.update({
          where: { id: stock.id },
          data: { quantity: { decrement: item.quantity } },
        });

        if (updatedStock.quantity === 0) {
          // 판매자 및 장바구니 유저들에게 품절 알림 생성 (비동기 호출 권장)
          await NotificationService.createSoldOutNotification(
            tx,
            item.productId,
            item.size,
          );
        }
      }

      // 3. 포인트 확인 및 차감
      const userPoint = await tx.userPoint.findUnique({ where: { userId } });
      if ((userPoint?.points || 0) < usePoints) {
        throw new Error('보유 포인트가 부족합니다.');
      }

      // 4. 주문 생성
      const order = await tx.order.create({
        data: {
          userId,
          orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          totalAmount: totalAmount - usePoints,
          usedPoints: usePoints,
          status: OrderStatus.PAID,
          recipientName,
          recipientPhone,
          deliveryAddress,
          paymentDate: new Date(),
          orderItems: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price, // 구매 시점 가격
              size: item.size,
            })),
          },
        },
      });

      // 5. 포인트 업데이트 및 등급 반영
      await tx.userPoint.update({
        where: { userId },
        data: {
          points: {
            decrement: usePoints,
            increment: Math.floor(
              (totalAmount - usePoints) * (userPoint?.pointRate || 0.01),
            ),
          },
          accumulatedAmount: { increment: totalAmount - usePoints },
        },
      });

      // 6. 장바구니 비우기
      await tx.cartItem.deleteMany({ where: { userId } });

      return order;
    });
  },
};
