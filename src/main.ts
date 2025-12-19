import app from './app.js';
import prisma from './common/prisma.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

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
