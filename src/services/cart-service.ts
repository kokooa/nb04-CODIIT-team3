import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const CartService = {
  // 장바구니 담기 및 수량 수정
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

  // 장바구니 목록 조회
  async getCart(userId: string) {
    return await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });
  },

  // 장바구–니 항목 삭제
  async removeFromCart(cartItemId: string) {
    return await prisma.cartItem.delete({
      where: { id: cartItemId },
    });
  },
};
