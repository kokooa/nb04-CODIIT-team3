// src/routes/metadata.routes.ts
import { Router } from 'express';
import { getGradeMetadata } from '../controllers/metadata-controller.js';

const router = Router();

router.get('/grade', getGradeMetadata);

export default router;
