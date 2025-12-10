// src/services/store-service.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface StoreCreationData {
  name: string;
  address: string;
  phoneNumber: string;
  storeImageUrl?: string;
  description?: string;
}

interface StoreUpdateData {
  name?: string;
  address?: string;
  phoneNumber?: string;
  storeImageUrl?: string;
  description?: string;
}

export class StoreService {
  /**
   * 새로운 스토어를 생성합니다.
   * @param sellerId 스토어를 생성할 판매자의 ID
   * @param data 스토어 생성에 필요한 데이터
   * @returns 생성된 스토어 객체
   */
  async createStore(sellerId: number, data: StoreCreationData) {
    // checkExistingStore 미들웨어에서 이미 판매자당 1개의 스토어만 허용하도록 검증됨
    return prisma.store.create({
      data: {
        sellerId,
        name: data.name,
        address: data.address,
        phoneNumber: data.phoneNumber,
        storeImageUrl: data.storeImageUrl,
        description: data.description,
      },
    });
  }

  /**
   * 판매자의 스토어 정보를 조회합니다.
   * @param sellerId 스토어를 조회할 판매자의 ID
   * @returns 판매자의 스토어 객체 또는 null
   */
  async getMyStore(sellerId: number) {
    return prisma.store.findUnique({
      where: { sellerId },
    });
  }

  /**
   * ID를 통해 스토어 정보를 조회합니다.
   * @param storeId 조회할 스토어의 ID
   * @returns 스토어 객체 또는 null
   */
  async getStoreById(storeId: number) {
    return prisma.store.findUnique({
      where: { id: storeId },
    });
  }

  /**
   * 스토어 정보를 수정합니다.
   * @param storeId 수정할 스토어의 ID
   * @param data 업데이트할 스토어 데이터
   * @returns 업데이트된 스토어 객체
   */
  async updateStore(storeId: number, data: StoreUpdateData) {
    return prisma.store.update({
      where: { id: storeId },
      data: data,
    });
  }

  /**
   * 사용자가 특정 스토어를 관심 스토어로 등록합니다.
   * @param userId 관심 스토어를 등록할 사용자의 ID
   * @param storeId 관심 스토어 ID
   * @returns 생성된 FavoriteStore 객체
   */
  async addFavoriteStore(userId: number, storeId: number) {
    // 이미 등록된 관심 스토어인지 확인 (unique 제약 조건으로 인해 Prisma에서 에러 발생 가능)
    try {
      return await prisma.favoriteStore.create({
        data: {
          userId,
          storeId,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') { // Unique constraint violation
        throw new Error('이미 관심 스토어로 등록된 스토어입니다.');
      }
      throw error;
    }
  }

  /**
   * 사용자가 특정 스토어를 관심 스토어에서 해제합니다.
   * @param userId 관심 스토어를 해제할 사용자의 ID
   * @param storeId 해제할 관심 스토어 ID
   * @returns 삭제된 FavoriteStore 객체
   */
  async removeFavoriteStore(userId: number, storeId: number) {
    return prisma.favoriteStore.delete({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
    });
  }

  /**
   * 사용자가 등록한 모든 관심 스토어 목록을 조회합니다.
   * @param userId 관심 스토어 목록을 조회할 사용자의 ID
   * @returns 관심 스토어 목록 (Store 정보 포함)
   */
  async getFavoriteStores(userId: number) {
    return prisma.favoriteStore.findMany({
      where: { userId },
      include: {
        store: true, // FavoriteStore에 연결된 Store 정보를 함께 가져옵니다.
      },
    });
  }
}
