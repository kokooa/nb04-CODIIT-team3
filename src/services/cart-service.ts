import { PrismaClient } from '@prisma/client';
import { buildFileUrl } from '../common/uploads.js';

// ✅ [Helper] 사이즈 매핑 함수 (PurchaseService와 동일하게 사용)
const mapSizeToResponse = (sizeStr: string) => {
  const sizeMap: { [key: string]: number } = {
    XS: 1,
    S: 2,
    M: 3,
    L: 4,
    XL: 5,
    Free: 6,
  };
  return {
    id: sizeMap[sizeStr] || 0,
    name: sizeStr,
    size: {
      en: sizeStr,
      ko: sizeStr,
    },
  };
};

class CartServiceClass {
  private prisma = new PrismaClient();

  async addToCart(
    userId: string,
    productId: string,
    size: any,
    quantity: number,
  ) {
    const sizeValue =
      typeof size === 'object' && size?.name ? size.name : String(size);

    return await this.prisma.cartItem.upsert({
      where: {
        userId_productId_size: {
          userId,
          productId,
          size: sizeValue,
        },
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      create: {
        userId,
        productId,
        size: sizeValue,
        quantity,
      },
    });
  }

  async getCart(userId: string) {
    // (1) DB에서 데이터 가져오기 (연관된 Store, Stocks, Reviews 포함)
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            store: true, // 상점 정보
            stocks: true, // 재고 정보
            reviews: {
              // 평점 계산용 리뷰
              select: { rating: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // (2) 데이터 가공 (요청하신 JSON 포맷으로 변환)
    const formattedItems = items.map(item => {
      // 사이즈 변환 (문자열 -> 객체/ID)
      const sizeObj = mapSizeToResponse(item.size);

      // 평점 계산
      const reviewsCount = item.product.reviews.length;
      const reviewsSum = item.product.reviews.reduce(
        (acc, cur) => acc + cur.rating,
        0,
      );
      const reviewsRating = reviewsCount > 0 ? reviewsSum / reviewsCount : 0;

      // 할인율 계산
      const discountRate =
        item.product.price > 0 && item.product.discountPrice
          ? Math.round(
              ((item.product.price - item.product.discountPrice) /
                item.product.price) *
                100,
            )
          : 0;

      // 품절 여부 확인 (전체 옵션 재고 합산)
      const totalStock = item.product.stocks.reduce(
        (acc, s) => acc + s.quantity,
        0,
      );

      return {
        id: item.id,
        cartId: `cart-${userId}`, // 가상의 Cart ID
        productId: item.productId,
        sizeId: sizeObj.id, // 변환된 ID (예: L -> 4)
        quantity: item.quantity,
        createdAt: item.createdAt,
        updatedAt: item.createdAt, // CartItem엔 updatedAt이 없을 수 있어 createdAt 대체

        // 상품 상세 정보 구조화
        product: {
          id: item.product.id,
          storeId: item.product.storeId,
          name: item.product.name,
          price: item.product.price,
          image: buildFileUrl(item.product.image),
          discountRate: discountRate,
          discountStartTime: item.product.discountStart,
          discountEndTime: item.product.discountEnd,
          createdAt: item.product.createdAt,
          updatedAt: item.product.updatedAt,
          reviewsRating: reviewsRating,
          categoryId: 'CUID', // 카테고리 ID가 스키마에 없다면 임의값 혹은 Enum 매핑
          content: item.product.detailInfo, // detailInfo -> content 매핑
          isSoldOut: totalStock === 0,

          // 상점 정보
          store: {
            id: item.product.store.id,
            userId: item.product.store.sellerId,
            name: item.product.store.name,
            address: item.product.store.address,
            phoneNumber: item.product.store.phoneNumber,
            content: item.product.store.content || '',
            image: buildFileUrl(item.product.store.image),
            createdAt: item.product.store.createdAt,
            updatedAt: item.product.store.updatedAt,
            detailAddress: item.product.store.detailAddress,
          },

          // 재고 목록 (stocks) 가공
          stocks: item.product.stocks.map(s => {
            const sObj = mapSizeToResponse(s.size);
            return {
              id: s.id,
              productId: s.productId,
              sizeId: sObj.id,
              quantity: s.quantity,
              size: {
                id: sObj.id,
                size: sObj.size,
                name: sObj.name,
              },
            };
          }),
        },
      };
    });

    // (3) 최종 래퍼 객체 반환
    // DB에 'Cart' 테이블이 없으므로, CartItem들을 감싸는 가상의 Cart 객체를 만듭니다.
    return {
      id: `cart-${userId}`, // 임의의 Cart ID 생성
      buyerId: userId,
      createdAt: new Date(), // 현재 시간
      updatedAt: new Date(),
      items: formattedItems,
    };
  }

  // 3. 장바구니 수량 수정 (PATCH)
  async updateCartItem(itemId: string, quantity: number) {
    // 1. DB 업데이트
    const updatedItem = await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: quantity },
    });

    // 2. 응답 데이터 가공 (요청하신 포맷에 맞춤)
    // "L" -> sizeId: 4 변환
    const sizeObj = mapSizeToResponse(updatedItem.size);

    // 3. 배열([])로 감싸서 리턴
    return {
      id: updatedItem.id,
      cartId: `cart-${updatedItem.userId}`,
      productId: updatedItem.productId,
      sizeId: sizeObj.id,
      quantity: updatedItem.quantity,
      createdAt: updatedItem.createdAt,
      updatedAt: updatedItem.createdAt,
    };
  }

  async removeFromCart(id: string) {
    return await this.prisma.cartItem.delete({
      where: { id },
    });
  }
}

export const CartService = new CartServiceClass();
