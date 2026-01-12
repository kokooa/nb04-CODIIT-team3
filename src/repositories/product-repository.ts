import { PrismaClient, Prisma } from '@prisma/client';
import prisma from '../common/prisma.js';

export class ProductRepository {
  private prisma = new PrismaClient();

  async createProduct(data: any) {
    return await this.prisma.product.create({
      data: {
        name: data.name,
        price: data.price,
        detailInfo: data.detailInfo,
        image: data.image,
        category: data.category, // Service에서 이미 Enum(대문자)으로 변환됨
        discountPrice: data.discountPrice,
        discountStart: data.discountStart,
        discountEnd: data.discountEnd,
        store: {
          connect: { id: data.storeId },
        },
        stocks: {
          create: data.stocks, // [{ size: 'L', quantity: 20 }] 형태
        },
      },
      include: {
        store: true,
        stocks: true,
        reviews: true,
        inquiries: {
          include: {
            reply: {
              include: { seller: true },
            },
          },
        },
      },
    });
  }

  async getProducts(
    skip: number,
    take: number,
    where: Prisma.ProductWhereInput,
    orderBy: Prisma.ProductOrderByWithRelationInput,
  ) {
    // 1. 전체 개수 조회 (페이지네이션 계산용)
    const totalCount = await this.prisma.product.count({ where });

    // 2. 상품 목록 조회
    const products = await this.prisma.product.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        store: {
          select: { name: true }, // 상점 이름만 필요하므로 select 사용
        },
        stocks: true, // 재고 합산(품절 여부)을 위해 가져옴
        reviews: {
          select: { rating: true }, // 평점 평균 계산을 위해 rating만 가져옴 (Review 모델에 rating이 있다고 가정)
        },
      },
    });

    return { products, totalCount };
  }

  async getProductById(productId: string) {
    return await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        store: true, // 상점 정보
        stocks: true, // 재고 정보
        reviews: true, // 리뷰 통계 계산용
        inquiries: {
          // 문의 및 답변
          include: {
            reply: {
              include: { seller: true }, // 답변자(판매자/관리자) 정보
            },
          },
          orderBy: { createdAt: 'desc' }, // 최신 문의 순
        },
      },
    });
  }

  async findProductById(productId: string) {
    return prisma.product.findUnique({
      where: { id: productId },
      include: { stocks: true },
    });
  }

  async updateProduct(productId: string, data: any) {
    return prisma.product.update({
      where: { id: productId },
      data,
      include: { stocks: true },
    });
  }

  async deleteStocksByProduct(productId: string) {
    return this.prisma.productStock.deleteMany({
      where: { productId: productId },
    });
  }

  // prisma.schema에서 Cascade를 적용안해서 위험 부담이 있는걸 transaction으로 보완했습니다.
  async deleteProduct(productId: string) {
    return await this.prisma.$transaction(async tx => {
      await tx.cartItem.deleteMany({
        where: { productId: productId },
      });

      await tx.productStock.deleteMany({
        where: { productId: productId },
      });

      await tx.review.deleteMany({
        where: { productId: productId },
      });

      await tx.inquiry.deleteMany({
        where: { productId: productId },
      });

      await tx.orderItem.deleteMany({
        where: { productId: productId },
      });

      return await tx.product.delete({
        where: { id: productId },
      });
    });
  }
}
