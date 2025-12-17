import express from 'express';
import { productService } from '../services/product-service.js'; // Import productService

type Request = express.Request;
type Response = express.Response;
type NextFunction = express.NextFunction;

class ProductController {
  async getAllProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const sort = (req.query.sort as string) || 'newest'; // Default sort

      const { list, totalCount } = await productService.getAllProducts(page, pageSize, sort);
      res.status(200).json({ list, totalCount });
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
