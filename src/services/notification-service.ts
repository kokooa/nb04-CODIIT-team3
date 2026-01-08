import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class NotificationService {
  // 알림 생성 공통 로직
  private async createNotification(
    userId: string,
    message: string,
    type: string,
  ) {
    return await prisma.notification.create({
      data: {
        userId,
        message,
        type,
        isRead: false,
      },
    });
  }

  // 주문 완료 알림
  async createOrderNotification(userId: string, orderId: string) {
    return this.createNotification(
      userId,
      `주문이 완료되었습니다. 주문 번호: ${orderId}`,
      'ORDER_COMPLETED',
    );
  }

  // 문의 답변 알림
  async createInquiryReplyNotification(userId: string, productName: string) {
    return this.createNotification(
      userId,
      `문의하신 상품 [${productName}]에 대한 답변이 등록되었습니다.`,
      'INQUIRY_REPLY',
    );
  }

  // 알림 목록 조회
  async getNotifications(userId: string) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 알림 읽음 처리
  async markAsRead(notificationId: string) {
    return await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }
}
