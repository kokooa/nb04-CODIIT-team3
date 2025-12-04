import { Router } from 'express';
import { signup, updateUser } from '../controllers/user-controller.js';
import { authMiddleware } from '../common/auth-middleware.js';
const router = Router();

router.post('/', signup);
router.patch('/me', authMiddleware, updateUser);

export default router;
