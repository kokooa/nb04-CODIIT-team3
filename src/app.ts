import inquiryRoutes from './routes/inquiry-router.js';
import express from 'express';
import prisma from './common/prisma.js';

const app = express();

// 미들웨어 설정
app.use(express.json());
app.use('/api', inquiryRoutes);

// 에러 핸들러
// 구현 예정

// 명시적 DB 연결
await prisma.$connect();
console.log('데이터베이스에 성공적으로 연결됨.');

export default app;
