import express from 'express';
import { PointController } from '../controllers/point-controller.js';
import { authMiddleware } from '../common/middlewares.js';

const pointRouter = express.Router();

// GET /points/me
pointRouter.get('/me', authMiddleware, PointController.getMyPointInfo);

export { pointRouter };
