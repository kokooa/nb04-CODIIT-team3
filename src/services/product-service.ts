import prisma from '../models/index.js';
import type { Product as PrismaProduct } from '@prisma/client';

class ProductService {
  async getAllProducts(page: number, pageSize: number, sort: string) {
    const skip = (page - 1) * pageSize;
    let orderBy: any = {};

    switch (sort) {
      case 'salesRanking':
        orderBy = { totalSales: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'priceAsc':
        orderBy = { price: 'asc' };
        break;
      case 'priceDesc':
        orderBy = { price: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' }; // Default sort
    }

    const products = await prisma.product.findMany({
      skip,
      take: pageSize,
      orderBy,
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const totalCount = await prisma.product.count();

    const formattedProducts = products.map((product: PrismaProduct & { store: { id: number, name: string } }) => {
      // Calculate discountPrice and discountRate if applicable
      let discountPrice: number | null = null;
      let discountRate: number | null = null;

      if (product.discountPrice && product.price && product.discountStart && product.discountEnd) {
        const now = new Date();
        if (now >= product.discountStart && now <= product.discountEnd) {
          discountPrice = product.discountPrice;
          discountRate = Math.round(((product.price - product.discountPrice) / product.price) * 100);
        }
      }

      return {
        id: String(product.id), // Ensure ID is a string as per frontend type
        storeId: String(product.storeId), // Ensure storeId is a string
        storeName: product.store.name,
        name: product.name,
        image: product.mainImageUrl, // Frontend uses 'image', backend 'mainImageUrl'
        price: product.price,
        discountPrice: discountPrice,
        discountRate: discountRate,
        discountStartTime: product.discountStart ? product.discountStart.toISOString() : null,
        discountEndTime: product.discountEnd ? product.discountEnd.toISOString() : null,
        reviewsCount: 0, // Placeholder, actual count needs to be fetched
        reviewsRating: 0, // Placeholder, actual rating needs to be fetched
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
        sales: product.totalSales, // Frontend uses 'sales', backend 'totalSales'
      };
    });


    return {
      list: formattedProducts,
      totalCount,
    };
  }
}

export const productService = new ProductService();
