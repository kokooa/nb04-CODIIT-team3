// src/controllers/notification.controller.ts
import type { Request, Response } from 'express';
import { sseManager } from '../common/sse-manager.js';
import { HttpError } from '../utils/error-handler.js';
import { NotificationService } from '../services/notification-service.js';

const notificationService = new NotificationService();

export const streamNotifications = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new HttpError('인증된 사용자가 아닙니다.', 401);
  }
  const userId = req.user.id;

  // 1. SSE 필수 헤더 설정
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // 헤더를 즉시 전송

  // 2. 클라이언트 연결 추가
  sseManager.addClient(userId, res);

  // 3. 연결 확인용 더미 데이터 전송
  // res.write(`data: ${JSON.stringify({ message: 'SSE 연결 성공' })}\n\n`);

  // 3.1 확인하지 않은 알림이 있으면 즉시 전송
  const notiDto = {
    userId,
    page: 10,
    pageSize: 10,
    sort: 'recent' as 'recent' | 'old',
    filter: 'unChecked' as 'unChecked' | 'all' | 'checked',
  };

  const { list } = await notificationService.getNotifications(notiDto);

  list.forEach(noti => {
    const message = `data: ${JSON.stringify(noti)}\n\n`;
    res.write(message);
  });

  // 4. 클라이언트가 연결을 끊었을 때 처리
  req.on('close', () => {
    sseManager.removeClient(userId, res);
    console.log('SSE 연결 종료');
    res.end();
  });
};
