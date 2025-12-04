import { Router } from 'express';
import multer from 'multer';
import {
  getUser,
  signup,
  unregister,
  updateUser,
} from '../controllers/user-controller.js';
import { authMiddleware } from '../common/middlewares.js';

const router = Router();
const upload = multer();

router.post('/', signup);
router.get('/me', authMiddleware, getUser);
router.patch('/me', authMiddleware, upload.none(), updateUser);
router.delete('/delete', authMiddleware, unregister);
export default router;
