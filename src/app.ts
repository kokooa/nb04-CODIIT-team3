import express from 'express';
import cors from 'cors';
import userRouter from './routes/user-router.js';
import authRouter from './routes/auth-router.js';
import cookieParser from 'cookie-parser';
import metadataRouter from './routes/metadata-router.js';
import notificationRouter from './routes/notification.router.js';
import inquiryRoutes from './routes/inquiry-router.js';
import reviewRoutes from './routes/review-router.js';
import { errorHandler } from './common/error-handler.js';
// prisma import는 제거해도 됩니다 (main.ts에서 관리하므로)

const app = express();

app.use(
  cors({
    origin: 'http://localhost:3000', // 프론트엔드 포트
    // origin: 'http://ec2-54-180-30-149.ap-northeast-2.compute.amazonaws.com', // 배포용 프론트엔드 도메인
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// HTTP 요청 출력
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get('/', (req, res) => {
  res.status(200).send('Health OK');
});

// 라우터 설정
app.use('/users', userRouter);
app.use('/auth', authRouter);
app.use('/metadata', metadataRouter);
app.use('/notifications', notificationRouter);
app.use('/inquiries', inquiryRoutes);
app.use('/review', reviewRoutes);

// 에러 핸들러
app.use(errorHandler);

// 💡 여기서 app.listen과 prisma.$connect를 삭제했습니다!

export default app;
