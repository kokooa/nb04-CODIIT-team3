import express from 'express';
import cors from 'cors';
import productRoutes from "./routes/product-router.js";

const app = express();

app.use(
  cors({
    origin: 'http://localhost:3000', 
    credentials: true,
  }),
);

app.use(express.json());

app.use(productRoutes);

const PORT: number = Number(process.env.PORT) || 4000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});