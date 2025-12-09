import type { Request, Response } from "express";
import { ProductService } from "../services/product-service.js";

export class ProductController {
  private productService = new ProductService();

  createProduct = async (req: Request, res: Response) => {
    try {
      const product = await this.productService.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: "상품 등록 실패" });
    }
  };

  getProducts = async (req: Request, res: Response) => {
    try {
      const products = await this.productService.getProducts(req.query);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "상품 조회 실패" });
    }
  };

  updateProduct = async (req: Request, res: Response) => {
    try {
      const productId = Number(req.params.productId);
      const product = await this.productService.updateProduct(productId, req.body);
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "상품 수정 실패" });
    }
  };

  getProductById = async (req: Request, res: Response) => {
    try {
      const productId = Number(req.params.productId);
      const product = await this.productService.getProductById(productId);
      if (!product) return res.status(404).json({ error: "상품 없음" });
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "상품 조회 실패" });
    }
  };

  deleteProduct = async (req: Request, res: Response) => {
    try {
      const productId = Number(req.params.productId);
      await this.productService.deleteProduct(productId);
      res.json({ message: "삭제 완료" });
    } catch (error) {
      res.status(500).json({ error: "상품 삭제 실패" });
    }
  };
}