import dotenv from 'dotenv';
dotenv.config(); // 환경 변수를 가장 먼저 로드해야 합니다.

import dotenv from 'dotenv';
dotenv.config(); // 환경 변수를 가장 먼저 로드해야 합니다.

import app from './app.js';
import prisma from './common/prisma.js';
import http from 'node:http';

//const PORT = process.env.PORT || 4000; // 포트를 4000으로 통일하거나 .env 설정을 따름
const PORT: number = Number(process.env.PORT) || 4000;

async function bootstrap() {
  try {
    // 1. DB 연결
    await prisma.$connect();
    console.log('데이터베이스에 성공적으로 연결됨.');

    // 2. 서버 실행
    // const server = app.listen(PORT, '0.0.0.0', () => {
    //   console.log(`서버 실행 중: http://localhost:${PORT}`);
    //});
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`서버 실행 중: http://localhost:${PORT}`);
    });

    // 3. Graceful shutdown 설정
    const gracefulShutdown = async () => {
      console.log('\nShutting down gracefully..');
      server.close(async () => {
        console.log('Closed out remaining connections.');
        await prisma.$disconnect();
        console.log('Disconnected from database.');
        process.exit(0);
      });
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
  } catch (error) {
    console.error('서버 시작 중 오류 발생:', error);
    process.exit(1);
  }
}

bootstrap();
