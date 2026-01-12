import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// 라우터 임포트
import userRouter from './routes/user-router.js';
import authRouter from './routes/auth-router.js';
import metadataRouter from './routes/metadata-router.js';
import notificationRouter from './routes/notification-router.js';
import inquiryRoutes from './routes/inquiry-router.js';
import reviewRoutes from './routes/review-router.js';
import storeRouter from './routes/store-router.js';
import cartRouter from './routes/cart-router.js';
import purchaseRouter from './routes/purchase-router.js';
import productRouter from './routes/product-router.js';
import productReviewRouter from './routes/product-review-router.js';
import dashboardRouter from './routes/dashboard-router.js';
import { errorHandler } from './common/error-handler.js';

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// 디버깅을 위한 HTTP 요청 로그
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// 헬스 체크
app.get('/', (req, res) => {
  res.status(200).send('Health OK');
});

app.use('/users', userRouter);
app.use('/auth', authRouter);
app.use('/metadata', metadataRouter);
app.use('/notifications', notificationRouter);
app.use('/inquiries', inquiryRoutes);
app.use('/review', reviewRoutes);
app.use('/api/cart', cartRouter); // 장바구니 API
app.use('/api/purchase', purchaseRouter);
app.use('/stores', storeRouter);
app.use('/products', productRouter);
app.use('/product', productReviewRouter);
app.use('/dashboard', dashboardRouter);
app.use('/uploads', express.static('uploads'));

// [추가] 대시보드 라우터 등록
app.use('/dashboard', dashboardRouter);

// [추가] 대시보드 라우터 등록
app.use('/dashboard', dashboardRouter);

// 에러 핸들러 (모든 라우터 설정 뒤에 위치해야 함)
app.use(errorHandler);

export default app;
