import express from 'express';
import cors from 'cors';
import userRouter from './routes/user-router.js';
import authRouter from './routes/auth-router.js';
import cookieParser from 'cookie-parser';
import metadataRouter from './routes/metada-router.js';
import notificationRouter from './routes/notification.router.js';
import inquiryRoutes from './routes/inquiry-router.js';
import reviewRoutes from './routes/review-router.js';
import { errorHandler } from './common/error-handler.js';
import prisma from './common/prisma.js';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:3000', // 프론트엔드 포트
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// 미들웨어 설정
app.use('/users', userRouter);
app.use('/auth', authRouter);
app.use('/metadata', metadataRouter);
app.use('/notifications', notificationRouter);
app.use('/inquiries', inquiryRoutes);
app.use('/review', reviewRoutes);

// 에러 핸들러
app.use(errorHandler);

// 명시적 DB 연결
await prisma.$connect();
console.log('데이터베이스에 성공적으로 연결됨.');

export default app;
