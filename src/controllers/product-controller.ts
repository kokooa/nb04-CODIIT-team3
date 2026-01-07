import type { Request, Response } from 'express';
import { ProductService } from '../services/product-service.js';
import { StoreRepository } from '../repositories/store-repository.js';

export class ProductController {
  private productService = new ProductService();
  private storeRepository = new StoreRepository();

  createProduct = async (req: Request, res: Response) => {
    try {
      // 1. 로그인된 유저 ID 가져오기 (AuthMiddleware가 처리했다고 가정)
      // TypeScript 에러가 난다면 (req as any).user.id 로 임시 처리
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: '로그인이 필요합니다.' });
      }

      // 2. 유저 ID로 내 상점 찾기
      const myStore = await this.storeRepository.findStoreByUserId(userId);

      if (!myStore) {
        return res.status(403).json({
          error: '상점 정보를 찾을 수 없습니다. 판매자 등록이 되어 있나요?',
        });
      }

      // 3. 찾은 상점 ID를 사용하여 데이터 구성
      const { body, file } = req;

      const productData = {
        ...body,
        // [수정 핵심] category가 없으면 categoryName이라도 찾아서 넣어줍니다.
        category: body.category || body.categoryName,

        price: Number(body.price),
        discountRate: body.discountRate ? Number(body.discountRate) : 0,
        storeId: myStore.id, // 자동으로 찾은 상점 ID
        stocks:
          typeof body.stocks === 'string'
            ? JSON.parse(body.stocks)
            : body.stocks,
        image: file ? `/uploads/${file.filename}` : body.image,
      };
      console.log('Service로 넘기는 데이터:', productData);
      const product = await this.productService.createProduct(productData);
      return res.status(201).json(product);
    } catch (error: any) {
      console.error(error);
      return res
        .status(500)
        .json({ error: '상품 등록 실패', message: error.message });
    }
  };

  getProducts = async (req: Request, res: Response) => {
    try {
      // req.query를 그대로 서비스로 전달 (page, pageSize, category 등)
      const result = await this.productService.getProducts(req.query);

      return res.status(200).json(result);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({
        error: '상품 목록 조회 실패',
        message: error.message,
      });
    }
  };

  updateProduct = async (req: Request, res: Response) => {
    try {
      const productId = req.params.productId;
      if (!productId) {
        return res.status(400).json({ message: '상품 ID가 필요합니다.' });
      }

      const product = await this.productService.updateProduct(
        productId,
        req.body,
      );
      return res.json(product);
    } catch (error) {
      return res.status(500).json({ error: '상품 수정 실패' });
    }
  };

  getProductById = async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      if (!productId) {
        throw new Error('상품 정보가 없습니다.');
      }
      const product = await this.productService.getProductById(productId);

      return res.status(200).json(product);
    } catch (error: any) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      console.error(error);
      return res.status(500).json({ error: '상품 상세 조회 실패' });
    }
  };

  deleteProduct = async (req: Request, res: Response) => {
    try {
      const productId = req.params.productId;
      if (!productId) {
        return res.status(400).json({ message: '상품 ID가 필요합니다.' });
      }
      await this.productService.deleteProduct(productId);

      return res.json({ message: '삭제 완료' });
    } catch (error) {
      return res.status(500).json({ error: '상품 삭제 실패' });
    }
  };
}
