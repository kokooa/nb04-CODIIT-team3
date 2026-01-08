import { Router } from 'express';
import { streamNotifications } from '../controllers/notification-controller.js';
import { NotificationService } from '../services/notification-service.js';
import { authMiddleware } from '../common/middlewares.js';

const router = Router();
const notificationService = new NotificationService();

// 1. 실시간 알림 연결 (기존 기능)
// 프론트 요청 경로: GET /notifications/sse
router.get('/sse', streamNotifications);

// 2. [추가] 내 알림 목록 조회 API
// 프론트 요청 경로: GET /notifications
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const userId = (req as any).user.id; // authMiddleware에서 넣어준 유저 정보
    const notifications = await notificationService.getNotifications(userId);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
});

// 3. [추가] 알림 읽음 처리 API
// 프론트 요청 경로: PATCH /notifications/:id/read
router.patch('/:id/read', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    // id가 없을 경우 에러 처리 (타입 가드)
    if (!id) {
      throw new Error('알림 ID가 필요합니다.');
    }

    const updated = await notificationService.markAsRead(id);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

export default router;
