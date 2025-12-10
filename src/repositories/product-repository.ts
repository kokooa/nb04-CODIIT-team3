import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ProductRepository {

  // 이름으로 상품 조회
  async findProductByName(name: string) {
    return prisma.product.findFirst({
      where: { name },
    });
  }

  // 스토어 조회
  async findStoreById(storeId: number) {
    return prisma.store.findUnique({
      where: { id: storeId },
    });
  }

  // 카테고리 조회
  async findCategoryById(categoryName: string) {
    return prisma.category.findUnique({
      where: { name: categoryName },
    });
  }

  // 상품 생성
  async createProduct(data: any) {
    return prisma.product.create({
      data,
      include: {
        stocks: true,
        category: true,
        store: true,
      },
    });
  }

  // 상품 목록 조회
  async getProducts(filter: any, orderBy: any, skip: number, take: number) {
    return prisma.product.findMany({
      where: filter,
      orderBy,
      skip,
      take,
      include: {
        stocks: true,
        category: true,
        store: true,
        reviews: {
          include: {
            user: {
              select: { id: true, nickname: true },
            },
          },
        },
      },
    });
  }

  // 단일 상품 조회
  async findProductById(productId: number) {
    return prisma.product.findUnique({
      where: { id: productId },
    });
  }

  // 단일 상품 상세 조회
  async findProductDetailById(productId: number) {
    return prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        store: true,
        stocks: true,
        reviews: {
          include: {
            user: {
              select: { id: true, nickname: true },
            },
          },
        },
        inquiries: {
          include: {
            user: { select: { id: true, nickname: true } },
            answer: true, 
          },
        },
      },
    });
  }

  // 상품 수정
  async updateProduct(productId: number, data: any) {
    if (data.stocks) {
      await this.deleteStocksByProduct(productId);
      await this.createStocks(productId, data.stocks);
      delete data.stocks; 
    }

    return prisma.product.update({
      where: { id: productId },
      data,
      include: {
        stocks: true,
        category: true,
        store: true,
      },
    });
  }

  // 상품 삭제
  async deleteProduct(productId: number) {
    return prisma.product.delete({
      where: { id: productId },
    });
  }

  // 재고 삭제
  async deleteStocksByProduct(productId: number) {
    return prisma.stock.deleteMany({
      where: { productId },
    });
  }

  // 재고 생성
  async createStocks(productId: number, stocks: { size: string; quantity: number }[]) {
    return prisma.stock.createMany({
      data: stocks.map((s) => ({
        productId,
        size: s.size,
        quantity: s.quantity,
      })),
    });
  }
}
