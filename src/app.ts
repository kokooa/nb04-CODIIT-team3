import express from 'express';
import cors from 'cors';
import userRouter from './routes/user-router.js';
import authRouter from './routes/auth-router.js';
const app = express();

app.use(
  cors({
    origin: 'http://localhost:3000', // 프론트엔드 포트
    credentials: true,
  }),
);

app.use(express.json());

app.use('/users', userRouter);
app.use('/auth', authRouter);

const PORT: number = Number(process.env.PORT) || 4000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
