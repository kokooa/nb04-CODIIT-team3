import { PrismaClient, type Product } from "@prisma/client";

const prisma = new PrismaClient();

export class ProductRepository {
  async createProduct(data: any): Promise<Product> {
    return prisma.product.create({
      data,
      include: { stocks: true }
    });
  }

  async getProducts(filter: any, orderBy: any, skip: number, take: number) {
    return prisma.product.findMany({
      where: filter,
      orderBy,
      skip,
      take,
      include: { stocks: true }
    });
  }

  async findProductById(productId: string) {
    return prisma.product.findUnique({
      where: { id: productId },
      include: { stocks: true }
    });
  }

  async updateProduct(productId: string, data: any) {
    return prisma.product.update({
      where: { id: productId },
      data,
      include: { stocks: true }
    });
  }

  async deleteProduct(productId: string) {
    return prisma.product.delete({
      where: { id: productId }
    });
  }

  async deleteStocksByProduct(productId: string) {
    return prisma.productStock.deleteMany({
      where: { productId }
    });
  }
}