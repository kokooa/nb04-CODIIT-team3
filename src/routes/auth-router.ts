import { Router } from 'express';
import { login, logout, reload } from '../controllers/auth-controller.js';
import { authMiddleware } from '../common/auth-middleware.js';
const router = Router();

router.post('/login', login);
router.post('/refresh', reload);
router.post('/logout', authMiddleware, logout);

export default router;
