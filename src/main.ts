import app from './app.js';
import prisma from './common/prisma.js';
import dotenv from 'dotenv';
dotenv.config(); //환경 변수

const PORT = Number(process.env.PORT) || 4000; // 포트를 4000으로 통일하거나 .env 설정을 따름

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}..`);
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('Gracefully shutting down...');

  server.close(async () => {
    console.log('Closed out remaining connections.');

    await prisma.$disconnect();
    console.log('Disconnected from database.');

    console.log('Shutting down gracefully..');
    process.exit(0);
  });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
