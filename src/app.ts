import express from 'express';
type Request = express.Request;
type Response = express.Response;
type NextFunction = express.NextFunction;
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth-router';
import { userRouter } from './routes/user-router';
import { storeRouter } from './routes/store-router';
import { productRouter } from './routes/product-router';
import { orderRouter } from './routes/order-router';
import { commRouter } from './routes/comm-router';
import { dashboardRouter } from './routes/dashboard-router';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routers
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/stores', storeRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
app.use('/api/community', commRouter); // Assuming '/api/community' for comm-router
app.use('/api/dashboard', dashboardRouter);

// Default route
app.get('/', (req: Request, res: Response) => {
  res.send('Server is running');
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
