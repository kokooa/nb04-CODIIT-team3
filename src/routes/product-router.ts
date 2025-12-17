import { Router } from 'express';
import { productController } from '../controllers/product-controller.js';

const productRouter = Router();

productRouter.get(
  '/',
  productController.getAllProducts
);

export { productRouter };
