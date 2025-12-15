// src/controllers/notification.controller.ts
import type { Request, Response } from 'express';

export const streamNotifications = (req: Request, res: Response) => {
  // 1. SSE 필수 헤더 설정
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // 헤더를 즉시 전송

  // 2. 연결 확인용 더미 데이터 전송 (선택사항)
  res.write(`data: ${JSON.stringify({ message: '연결 성공' })}\n\n`);

  // 3. 클라이언트가 연결을 끊었을 때 처리
  req.on('close', () => {
    console.log('SSE 연결 종료');
    res.end();
  });
};
