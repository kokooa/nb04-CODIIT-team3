import { ProductRepository } from "../repositories/product-repository.js";
import type {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto
} from "../dtos/product-dto.js";

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
      stocks
    } = body;

    const data = {
      name,
      price,
      content,
      image,
      discountRate,
      discountStartTime: discountStartTime ? new Date(discountStartTime) : null,
      discountEndTime: discountEndTime ? new Date(discountEndTime) : null,
      categoryName,
      stocks: {
        create: stocks.map((s) => ({
          size: s.size,
          quantity: s.quantity
        }))
      }
    };

    return this.productRepository.createProduct(data);
  }

  async getProducts(query: ProductQueryDto) {
    const { page = 1, pageSize = 10, search, sort, priceMin, priceMax, size, categoryName } = query;

    const filter: any = {};
    if (search) filter.name = { contains: search };
    if (categoryName) filter.categoryName = categoryName;
    if (priceMin || priceMax)
      filter.price = {
        gte: priceMin,
        lte: priceMax
      };
    if (size)
      filter.stocks = { some: { size } };

    const orderBy = (() => {
      switch (sort) {
        case "recent": return { createdAt: "desc" };
        case "lowPrice": return { price: "asc" };
        case "highPrice": return { price: "desc" };
        case "highRating": return { rating: "desc" };
        case "salesRanking": return { sales: "desc" };
        case "mostReviewed": return { reviewCount: "desc" };
        default: return { createdAt: "desc" };
      }
    })();

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    return this.productRepository.getProducts(filter, orderBy, skip, take);
  }

  async updateProduct(productId: number, body: UpdateProductDto) {
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
    return this.productRepository.findProductById(productId);
  }

  async deleteProduct(productId: number) {
    return this.productRepository.deleteProduct(productId);
  }
}
