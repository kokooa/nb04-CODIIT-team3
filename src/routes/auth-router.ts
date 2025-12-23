import { Router } from 'express';
import { login, logout, reload } from '../controllers/auth-controller.js';
import { authMiddleware, refreshMiddleware } from '../common/middlewares.js';
const router = Router();

router.post('/login', login);
router.post('/refresh', refreshMiddleware, reload);
router.post('/logout', authMiddleware, logout);

export default router;
