// src/services/store-service.ts
import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';
import { StoreRepository } from '../repositories/store-repository.js';
import { ProductRepository } from '../repositories/product-repository.js';

const prisma = new PrismaClient();
const storeRepository = new StoreRepository();
const productRepository = new ProductRepository();

export interface StoreCreationData {
  name: string;
  address: string;
  detailAddress: string;
  phoneNumber: string;
  content?: string | null;
  image?: string | null;
}

interface StoreUpdateData {
  name?: string;
  address?: string;
  detailAddress?: string;
  phoneNumber?: string;
  content?: string | null;
  image?: string | null;
}

export class StoreService {
  /**
   * 새로운 스토어를 생성합니다.
   * @param sellerId 스토어를 생성할 판매자의 ID
   * @param data 스토어 생성에 필요한 데이터
   * @returns 생성된 스토어 객체
   */
  async createStore(userId: string, data: StoreCreationData) {
    // checkExistingStore 미들웨어에서 이미 판매자당 1개의 스토어만 허용하도록 검증됨
    return prisma.store.create({
      data: {
        seller: { connect: { id: userId } },
        name: data.name,
        address: data.address,
        detailAddress: data.detailAddress,
        phoneNumber: data.phoneNumber,
        image: data.image === undefined ? null : data.image,
        content: data.content === undefined ? null : data.content,
      },
    });
  }

  /**
   * 판매자의 스토어 정보를 조회합니다.
   * @param sellerId 스토어를 조회할 판매자의 ID
   * @returns 판매자의 스토어 객체 또는 null (집합 필드 포함)
   */
  async getMyStore(userId: string) {
    // 타입을 string으로 변경
    const store = await prisma.store.findUnique({
      where: {
        sellerId: userId,
      },
      include: {
        products: {
          select: {
            totalSales: true,
          },
        },
        favorites: {
          // 총 관심 스토어 수 및 월별 관심 스토어 수를 위해 모든 관심 스토어를 포함
          select: {
            createdAt: true, // 월별 관심 스토어 수 계산에 필요
          },
        },
      },
    });

    if (!store) {
      return null;
    }

    const productCount = store.products.length;

    const totalSoldCount = store.products.reduce(
      (sum, product) => sum + (product.totalSales || 0),
      0,
    );

    // 총 관심 스토어 수 계산
    const favoriteCount = store.favorites.length;

    // 월별 관심 스토어 수 계산
    const startOfMonth = dayjs().startOf('month').toDate();
    const endOfMonth = dayjs().endOf('month').toDate();
    const monthFavoriteCount = store.favorites.filter(
      (fav) => fav.createdAt >= startOfMonth && fav.createdAt < endOfMonth,
    ).length;

    // 백엔드 필드를 프론트엔드에서 예상하는 필드로 매핑
    const { products, favorites, sellerId, ...rest } = store;

    return {
      ...rest,
      userId: sellerId,
      productCount,
      favoriteCount, // 총 관심 스토어 수 추가
      monthFavoriteCount,
      totalSoldCount,
    };
  }

  async getMyStoreWithProducts(
    userId: string,
    page: number,
    limit: number,
  ) {
    const store = await storeRepository.findStoreByUserId(userId);

    if (!store) {
      return null;
    }

    const { products, totalCount } = await productRepository.getProducts(
      (page - 1) * limit,
      limit,
      { storeId: store.id },
      { createdAt: 'desc' },
    );

    const formattedProducts = products.map((product) => {
      const stock = product.stocks.reduce(
        (acc, cur) => acc + cur.quantity,
        0,
      );
      const isSoldOut = stock === 0;
      const isDiscount =
        product.discountPrice !== null &&
        product.discountPrice !== undefined &&
        product.discountStart &&
        product.discountEnd &&
        dayjs().isAfter(dayjs(product.discountStart)) &&
        dayjs().isBefore(dayjs(product.discountEnd));

      return {
        id: product.id,
        image: product.image,
        name: product.name,
        price: product.price,
        createdAt: product.createdAt,
        isSoldOut,
        stock,
        isDiscount,
      };
    });

    return { list: formattedProducts, totalCount };
  }

  /**
   * ID를 통해 스토어 정보를 조회합니다.
   * @param storeId 조회할 스토어의 ID
   * @returns 스토어 객체 또는 null
   */
  async getStoreById(storeId: string) {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        favorites: {
          select: { id: true },
        },
      },
    });

    if (!store) return null;

    const favoriteCount = store.favorites.length;

    const { favorites, sellerId, ...rest } = store;

    return {
      ...rest,
      userId: sellerId,
      favoriteCount,
    };
  }

  /**
   * 스토어 정보를 수정합니다.
   * @param storeId 수정할 스토어의 ID
   * @param data 업데이트할 스토어 데이터
   * @returns 업데이트된 스토어 객체
   */
  async updateStore(storeId: string, data: StoreUpdateData) {
    const updatedStore = await prisma.store.update({
      where: { id: storeId },
      data: {
        // ✅ 수정: 값이 undefined가 아닐 때만 객체에 키를 추가합니다.
        ...(data.name !== undefined && { name: data.name }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.detailAddress !== undefined && {
          detailAddress: data.detailAddress,
        }),
        ...(data.phoneNumber !== undefined && {
          phoneNumber: data.phoneNumber,
        }),

        // ✅ 수정: content/image가 null이면(삭제 요청) null이 들어가고,
        // undefined면(수정 안 함) 아예 키가 안 들어갑니다. (기존 || null 로직 버그 해결)
        ...(data.content !== undefined && { content: data.content }),
        ...(data.image !== undefined && { image: data.image }),
      },
    });

    const { sellerId, ...rest } = updatedStore;

    return {
      ...rest,
      userId: sellerId,
    };
  }

  /**
   * 사용자가 특정 스토어를 관심 스토어로 등록합니다.
   * @param userId 관심 스토어를 등록할 사용자의 ID
   * @param storeId 관심 스토어 ID
   * @returns 생성된 FavoriteStore 객체
   */
  async addFavoriteStore(userId: string, storeId: string) {
    // 이미 등록된 관심 스토어인지 확인 (unique 제약 조건으로 인해 Prisma에서 에러 발생 가능)
    try {
      const newFavorite = await prisma.favoriteStore.create({
        data: {
          userId,
          storeId,
        },
        include: {
          store: true,
        },
      });

      const { sellerId, ...storeRest } = newFavorite.store;

      return {
        ...storeRest,
        userId: sellerId,
      };
    } catch (error: any) {
      if (error.code === 'P2002') {
        // 유니크 제약 조건 위반
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
  async removeFavoriteStore(userId: string, storeId: string) {
    const deletedFavorite = await prisma.favoriteStore.delete({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
      include: {
        store: true,
      },
    });
    const { sellerId, ...storeRest } = deletedFavorite.store;

    return {
      ...storeRest,
      userId: sellerId,
    };
  }

  /**
   * 사용자가 등록한 모든 관심 스토어 목록을 조회합니다.
   * @param userId 관심 스토어 목록을 조회할 사용자의 ID
   * @returns 관심 스토어 목록 (Store 정보 포함)
   */
  async getFavoriteStores(userId: string) {
    return prisma.favoriteStore.findMany({
      where: { userId },
      include: {
        store: true, // FavoriteStore에 연결된 Store 정보를 함께 가져옵니다.
      },
    });
  }
}

