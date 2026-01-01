import { ProductRepository } from "../repositories/product-repository.js";
import type {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto
} from "../types/product-dto.js";

export class ProductService {
  private productRepository = new ProductRepository();
  async createProduct(body: CreateProductDto) {
    const {
      name,
      price,
      content,
      image,
      discountRate,
      discountStartTime,
      discountEndTime,
      categoryName,
      storeId,
      stocks
    } = body;

    const exists = await this.productRepository.findProductByName(name);
    if (exists) {
      throw {
        statusCode: 400,
        message: "잘못된 요청입니다." // Bad Request
      };
    }

    const store = await this.productRepository.findStoreById(storeId);
    if (!store) {
      throw {
        statusCode: 404,
        message: "스토어를 찾을 수 없습니다." // Not Found
      };
    }

    const category = await this.productRepository.findCategoryById(categoryName);
    if (!category) {
      throw {
        statusCode: 404,
        message: "카테고리가 없습니다." // Not Found
      };
    }

    const data = {
      name,
      price,
      content,
      image,
      discountRate,
      discountStartTime: discountStartTime ? new Date(discountStartTime) : null,
      discountEndTime: discountEndTime ? new Date(discountEndTime) : null,
      storeId,
      categoryName,
      stocks: {
        create: stocks.map((s) => ({
          size: s.size,
          quantity: s.quantity
        }))
      }
    };
    const product = await this.productRepository.createProduct(data);
    return product; 
  }

  async getProducts(query: ProductQueryDto) {
    const { page = 1, pageSize = 10, search, sort, priceMin, priceMax, size, categoryName } = query;

    const filter: any = {};
    if (search) filter.name = { contains: search };
    if (categoryName) filter.categoryId = categoryName;
    if (priceMin || priceMax) {
      filter.price = {
        gte: priceMin,
        lte: priceMax
      };
    }
    if (size) {
      filter.stocks = { some: { size } };
    }

    const orderBy = (() => {
      switch (sort) {
        case "recent": return { createdAt: "desc" };
        case "lowPrice": return { price: "asc" };
        case "highPrice": return { price: "desc" };
        case "highRating": return { reviewsRating: "desc" };
        case "salesRanking": return { sales: "desc" };
        case "mostReviewed": return { reviewsCount: "desc" };
        default: return { createdAt: "desc" };
      }
    })();

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    return this.productRepository.getProducts(filter, orderBy, skip, take);
  }

  async updateProduct(productId: number, body: UpdateProductDto) {
    const product = await this.productRepository.findProductById(productId);
    if (!product) {
      throw {
        statusCode: 404,
        message: "상품을 찾을 수 없습니다."
      };
    }

    const {
      name,
      price,
      content,
      image,
      discountRate,
      discountStartTime,
      discountEndTime,
      categoryName,
      isSoldOut,
      stocks
    } = body;

    const data: any = {
      name,
      price,
      content,
      image,
      discountRate,
      discountStartTime: discountStartTime ? new Date(discountStartTime) : undefined,
      discountEndTime: discountEndTime ? new Date(discountEndTime) : undefined,
      categoryName,
      isSoldOut
    };

    // 재고 갱신
    if (stocks) {
      await this.productRepository.deleteStocksByProduct(productId);
      data.stocks = {
        create: stocks.map((s) => ({
          size: s.size,
          quantity: s.quantity
        }))
      };
    }

    return this.productRepository.updateProduct(productId, data);
  }

  async getProductById(productId: number) {
    const product = await this.productRepository.findProductDetailById(productId);
    if (!product) {
      throw {
        statusCode: 404,
        message: "상품을 찾을 수 없습니다."
      };
    }
    return product;
  }

  async deleteProduct(productId: number) {
    const product = await this.productRepository.findProductById(productId);
    if (!product) {
      throw {
        statusCode: 404,
        message: "상품을 찾을 수 없습니다."
      };
    }

    return this.productRepository.deleteProduct(productId);
  }
}
