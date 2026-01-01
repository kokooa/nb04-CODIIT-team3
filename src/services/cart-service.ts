import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const CartService = {
  async addToCart(
    userId: string,
    productId: string,
    size: string,
    quantity: number,
  ) {
    return await prisma.cartItem.upsert({
      where: {
        userId_productId_size: { userId, productId, size },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        userId,
        productId,
        size,
        quantity,
      },
    });
  },

  async getCart(userId: string) {
    return await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });
  },

  async removeFromCart(id: string) {
    return await prisma.cartItem.delete({
      where: { id },
    });
  },
};
