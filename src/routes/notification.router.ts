// src/routes/notification.routes.ts
import { Router } from 'express';
import { streamNotifications } from '../controllers/notification-controller.js';

const router = Router();

// 프론트 요청 경로: /notifications/sse
router.get('/sse', streamNotifications);

export default router;
