import { Prisma } from '@prisma/client';
import { sseManager } from '../common/sse-manager.js';
import prisma from '../common/prisma.js';

export interface GetNotificationsDto {
  userId: string;
  page: number;
  pageSize: number;
  sort: 'recent' | 'old';
  filter: 'all' | 'unChecked' | 'checked';
}

export class NotificationService {
  // 알림 생성 공통 로직
  private async createNotification(
    userId: string,
    message: string,
    type: string,
  ) {
    const newNotification = await prisma.notification.create({
      data: {
        userId,
        message,
        type,
        isRead: false,
      },
    });

    const newNoti = {
      id: newNotification.id,
      userId: newNotification.userId,
      content: newNotification.message,
      isChecked: newNotification.isRead,
      createdAt: newNotification.createdAt,
      updatedAt: newNotification.createdAt,
    };

    // SSE로 실시간 알림 전송
    sseManager.sendNotification(userId, newNoti);

    return newNotification;
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
  async getNotifications(dto: GetNotificationsDto) {
    const { userId, page, pageSize, sort, filter } = dto;

    const where: Prisma.NotificationWhereInput = {
      userId,
    };

    if (filter === 'checked') {
      where.isRead = true;
    } else if (filter === 'unChecked') {
      where.isRead = false;
    }

    const orderBy: Prisma.NotificationOrderByWithRelationInput =
      sort === 'recent' ? { createdAt: 'desc' } : { createdAt: 'asc' };

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [notis, totalCount] = await prisma.$transaction([
      prisma.notification.findMany({
        where,
        select: {
          id: true,
          userId: true,
          message: true,
          isRead: true,
          createdAt: true,
        },
        orderBy,
        skip,
        take,
      }),
      prisma.notification.count({ where }),
    ]);

    const list = notis.map(noti => ({
      id: noti.id,
      userId: noti.userId,
      content: noti.message,
      isChecked: noti.isRead,
      createdAt: noti.createdAt,
      updatedAt: noti.createdAt,
    }));

    return {
      list,
      totalCount,
    };
  }

  // 알림 읽음 처리
  async markAsRead(notificationId: string) {
    return await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }
}
