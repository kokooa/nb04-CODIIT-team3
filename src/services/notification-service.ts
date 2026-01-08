import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const NotificationService = {
<<<<<<< HEAD
  // 품절 알림 생성 (판매자용 & 장바구니 담은 유저용)
  async createSoldOutNotification(tx: any, productId: string, size: string) {
    const product = await tx.product.findUnique({
      where: { id: productId },
      include: { store: true },
    });

    // A. 판매자 알림
    await tx.notification.create({
      data: {
        userId: product.store.sellerId,
        type: 'SOLD_OUT',
        message: `[재고부족] ${product.name} (${size}) 상품이 품절되었습니다.`,
      },
    });

    // B. 장바구니에 이 상품을 담아둔 구매자들 알림
    const cartUsers = await tx.cartItem.findMany({
      where: { productId, size },
    });

    for (const cart of cartUsers) {
      await tx.notification.create({
        data: {
          userId: cart.userId,
          type: 'CART_SOLD_OUT',
          message: `장바구니에 담으신 ${product.name} (${size}) 상품이 방금 품절되었습니다.`,
        },
      });
    }
  },

  // 문의 답변 알림
  async createInquiryReplyNotification(userId: string, productName: string) {
    return await prisma.notification.create({
      data: {
        userId,
        type: 'INQUIRY_REPLY',
        message: `내 문의에 대한 답변이 등록되었습니다: ${productName}`,
      },
=======
  // 알림 생성 로직 (트랜잭션 내부에서 실행 가능하도록 tx 인자 수용)
  async createNotification(
    userId: string,
    type: string,
    message: string,
    tx?: any,
  ) {
    const db = tx || prisma;
    return await db.notification.create({
      data: { userId, type, message },
    });
  },

  async getMyNotifications(userId: string) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
>>>>>>> 3d34b2d6e45a49db0c568ac72b7d1cd65a5e49c3
    });
  },
};
