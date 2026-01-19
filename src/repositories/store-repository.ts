// repositories/store-repository.ts (혹은 product-repository 내부에 작성해도 됨)
import { PrismaClient } from '@prisma/client';

export class StoreRepository {
  private prisma = new PrismaClient();

  // 유저 ID로 상점 찾기
  async findStoreByUserId(userId: string) {
    return await this.prisma.store.findFirst({
      where: {
        // 스키마에 따라 필드명이 userId 혹은 sellerId 일 수 있습니다. 확인 필요!
        sellerId: userId,
      },
    });
  }
}
