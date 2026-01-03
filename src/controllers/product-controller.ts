import type { Request, Response } from "express";
import { ProductService } from "../services/product-service.js";

export class ProductController {
  private productService = new ProductService();

  createProduct = async (req: Request, res: Response) => {
    try {
      const product = await this.productService.createProduct(req.body);

      return res.status(201).json(product);
    } catch (error: any) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          statusCode: error.statusCode,
          message: error.message,
          error: error.statusCode === 400 ? "Bad Request" : "Not Found"
        });
      }

      return res.status(500).json({ error: "상품 등록 실패" });
    }
  };

  getProducts = async (req: Request, res: Response) => {
    try {
      const products = await this.productService.getProducts(req.query);
      return res.json(products);
    } catch (error) {
      return res.status(500).json({ error: "상품 조회 실패" });
    }
  };

  updateProduct = async (req: Request, res: Response) => {
    try {
      const productId = req.params.productId;
      if (!productId) {
        return res.status(400).json({ message: "상품 ID가 필요합니다." });
      }

      const product = await this.productService.updateProduct(productId, req.body);
      return res.json(product);
    } catch (error) {
      return res.status(500).json({ error: "상품 수정 실패" });
    }
  };

  getProductById = async (req: Request, res: Response) => {
    try {
      const productId = req.params.productId;
      if (!productId) {
        return res.status(400).json({ message: "상품 ID가 필요합니다." });
      }

      const product = await this.productService.getProductById(productId);

      if (!product) {
        return res.status(404).json({
          statusCode: 404,
          message: "상품을 찾을 수 없습니다.",
          error: "Not Found"
        });
      }

      return res.json(product);
    } catch (error) {
      return res.status(500).json({ error: "상품 조회 실패" });
    }
  };

  deleteProduct = async (req: Request, res: Response) => {
    try {
      const productId = req.params.productId;
      if (!productId) {
        return res.status(400).json({ message: "상품 ID가 필요합니다." });
      }
      await this.productService.deleteProduct(productId);

      return res.json({ message: "삭제 완료" });
    } catch (error) {
      return res.status(500).json({ error: "상품 삭제 실패" });
    }
  };
}
