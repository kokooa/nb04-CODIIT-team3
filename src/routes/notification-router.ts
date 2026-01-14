import { Router } from 'express';
import { streamNotifications } from '../controllers/notification-controller.js';
import { NotificationService } from '../services/notification-service.js';
import { authMiddleware } from '../common/middlewares.js';
import { HttpError } from '../utils/error-handler.js';

const router = Router();
const notificationService = new NotificationService();

// 실시간 알림 연결
router.get('/sse', authMiddleware, streamNotifications);

// 내 알림 목록 조회
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      sort = 'recent',
      filter = 'all',
    } = req.query;

    if (!req.user || !req.user.id) {
      throw new HttpError('인증된 사용자가 아닙니다.', 401);
    }

    const userId = req.user.id;

    const notiDto = {
      userId,
      page: parseInt(page as string, 10),
      pageSize: parseInt(pageSize as string, 10),
      sort: sort as 'recent' | 'old',
      filter: filter as 'all' | 'unChecked' | 'checked',
    };

    const notifications = await notificationService.getNotifications(notiDto);

    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
});

// 알림 읽음 처리
router.patch('/:id/read', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new Error('알림 ID가 필요합니다.');
    }
    const updated = await notificationService.markAsRead(id);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// [중요] 방법 A: 기본 내보내기로 설정
export default router;
