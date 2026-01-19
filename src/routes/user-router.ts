import { Router } from 'express';
import { upload } from '../common/uploads.js';
import {
  getMyFavoriteStores,
  getMyPointInfo,
  getUser,
  signup,
  unregister,
  updateUser,
} from '../controllers/user-controller.js';
import { authMiddleware } from '../common/middlewares.js';

const router = Router();

router.post('/', signup);
router.get('/me', authMiddleware, getUser);
router.get('/me/point', getMyPointInfo);
router.patch('/me', authMiddleware, upload.single('image'), updateUser);
router.delete('/delete', authMiddleware, unregister);

export default router;
