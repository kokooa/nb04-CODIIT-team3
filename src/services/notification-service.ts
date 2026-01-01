import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const NotificationService = {
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
    });
  },
};
