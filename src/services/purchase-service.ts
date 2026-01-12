import { PrismaClient, OrderStatus, Prisma } from '@prisma/client';
import { NotificationService } from './notification-service.js'; // 경로 확인 필요
import { buildFileUrl } from '../common/uploads.js'; // 경로 확인 필요

// ✅ [Helper] 사이즈 변환 함수 (공통 사용을 위해 클래스 밖이나 static으로 뺌)
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
    size: {
      en: sizeStr,
      ko: sizeStr,
    },
  };
};

// ✅ [New] ID -> 문자열 변환 맵
const mapIdToSize = (id: number): string => {
  const idMap: { [key: number]: string } = {
    1: 'XS',
    2: 'S',
    3: 'M',
    4: 'L',
    5: 'XL',
    6: 'Free',
  };
  return idMap[id] || 'Free'; // 매칭 안 되면 기본값 Free
};

class PurchaseServiceClass {
  // 멤버 변수로 선언하여 this.prisma 로 접근 가능하게 함
  private prisma = new PrismaClient();
  private notificationService = new NotificationService();

  // 1. 주문 생성 (구매하기)
  async createOrder(
    userId: string,
    orderData: {
      name: string;
      phone: string;
      address: string;
      orderItems: { productId: string; sizeId: number; quantity: number }[];
      usePoint: number;
    },
  ) {
    const {
      name,
      phone,
      address,
      orderItems: inputItems,
      usePoint,
    } = orderData;

    return await this.prisma.$transaction(async tx => {
      let subtotal = 0;
      let totalQuantity = 0;

      const orderItemDataList: Prisma.OrderItemUncheckedCreateWithoutOrderInput[] =
        [];

      for (const item of inputItems) {
        const sizeStr = mapIdToSize(item.sizeId);

        console.log(`🛒 주문 처리 중: ID(${item.sizeId}) -> Size(${sizeStr})`);

        const productStock = await tx.productStock.findUnique({
          where: {
            productId_size: {
              productId: item.productId,
              size: sizeStr,
            },
          },
          include: {
            product: true,
          },
        });

        if (!productStock || productStock.quantity < item.quantity) {
          throw new Error(
            `재고 부족: Product ${item.productId}, Size ${sizeStr}`,
          );
        }

        // 재고 차감
        await tx.productStock.update({
          where: { id: productStock.id },
          data: { quantity: { decrement: item.quantity } },
        });

        // 품절 알림 (재고가 0이 되었을 때)
        if (productStock.quantity - item.quantity === 0) {
          await this.notificationService.createOrderNotification(
            userId,
            `품절된 상품 ID: ${item.productId}`,
          );
        }

        const itemPrice = productStock.product.price;
        subtotal += itemPrice * item.quantity;
        totalQuantity += item.quantity;

        // DB에 저장할 데이터 준비
        orderItemDataList.push({
          productId: item.productId,
          size: sizeStr,
          quantity: item.quantity,
          price: itemPrice,
        });
      }

      const finalPrice = subtotal - usePoint;

      // 주문 생성
      const order = await tx.order.create({
        data: {
          userId,
          orderNumber: `ORD-${Date.now()}`,
          totalAmount: finalPrice,
          usedPoints: usePoint,
          status: OrderStatus.PAID,
          recipientName: name,
          recipientPhone: phone,
          deliveryAddress: address,
          paymentDate: new Date(),
          orderItems: {
            create: orderItemDataList,
          },
        },
        include: {
          orderItems: {
            include: {
              product: {
                include: {
                  reviews: true,
                },
              },
            },
          },
        },
      });

      // 장바구니 비우기
      await tx.cartItem.deleteMany({ where: { userId } });

      // 응답 데이터 생성
      const paymentResponse = {
        id: `PAY-${order.id}`,
        price: order.totalAmount,
        status: 'CompletedPayment',
        createdAt: order.paymentDate || order.createdAt,
        updatedAt: order.createdAt,
        orderId: order.id,
      };

      return {
        id: order.id,
        name: order.recipientName,
        phoneNumber: order.recipientPhone,
        address: order.deliveryAddress,
        subtotal: subtotal,
        totalQuantity: totalQuantity,
        usePoint: order.usedPoints,
        createdAt: order.createdAt,
        orderItems: order.orderItems.map(item => ({
          id: item.id,
          price: item.price,
          quantity: item.quantity,
          productId: item.productId,
          product: {
            name: item.product.name,
            image: buildFileUrl(item.product.image),
            reviews: item.product.reviews.map(r => ({
              id: r.id,
              rating: r.rating,
              content: r.content,
              createdAt: r.createdAt,
            })),
          },
          // ✅ 헬퍼 함수 사용하여 포맷 통일
          size: mapSizeToResponse(item.size),
          isReviewed: false, // 갓 구매한 상품이니 리뷰 없음
        })),
        payments: paymentResponse,
      };
    });
  }

  // 2. 구매 내역 조회
  async getPurchases(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    // 전체 개수 조회
    const total = await this.prisma.order.count({
      where: { userId },
    });

    // 주문 목록 조회
    const orders = await this.prisma.order.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: {
          include: {
            product: true,
            review: true, // 1:1 관계 리뷰
          },
        },
      },
    });

    // 응답 데이터 가공
    const data = orders.map(order => {
      const subtotal = order.orderItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      );
      const totalQuantity = order.orderItems.reduce(
        (acc, item) => acc + item.quantity,
        0,
      );

      const formattedItems = order.orderItems.map(item => {
        const myReview = item.review;
        const hasReview = !!myReview;

        return {
          id: item.id,
          price: item.price,
          quantity: item.quantity,
          productId: item.productId,
          product: {
            name: item.product.name,
            image: buildFileUrl(item.product.image),
            reviews: myReview
              ? [
                  {
                    id: myReview.id,
                    rating: myReview.rating,
                    content: myReview.content,
                    createdAt: myReview.createdAt,
                  },
                ]
              : [],
          },
          // ✅ 헬퍼 함수 사용
          size: mapSizeToResponse(item.size),
          isReviewed: hasReview,
        };
      });

      const paymentData = {
        id: order.id,
        price: order.totalAmount,
        status: order.status === 'PAID' ? 'CompletedPayment' : order.status,
        createdAt: order.paymentDate || order.createdAt,
        updatedAt: order.createdAt,
        orderId: order.id,
      };

      return {
        id: order.id,
        name: order.recipientName,
        phoneNumber: order.recipientPhone,
        address: order.deliveryAddress,
        subtotal: subtotal,
        totalQuantity: totalQuantity,
        usePoint: order.usedPoints,
        createdAt: order.createdAt,
        orderItems: formattedItems,
        payments: paymentData,
      };
    });

    // Meta 정보
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  // 주문 상세 조회 (단건)
  async getPurchaseById(userId: string, purchaseId: string) {
    // 1. DB 조회
    const order = await this.prisma.order.findUnique({
      where: { id: purchaseId },
      include: {
        orderItems: {
          include: {
            product: true, // 상품 정보
            review: true, // 이 주문 상품에 대한 리뷰 정보 (1:1)
          },
        },
      },
    });

    // 2. 예외 처리
    if (!order) {
      throw new Error('NOT_FOUND'); // 404 처리용
    }

    // 다른 사람의 주문을 보려고 할 때 방지
    if (order.userId !== userId) {
      throw new Error('FORBIDDEN'); // 403 처리용
    }

    // 3. 응답 데이터 가공 (목록 조회 로직과 동일)

    // (1) Subtotal 및 TotalQuantity 계산
    const subtotal = order.orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    const totalQuantity = order.orderItems.reduce(
      (acc, item) => acc + item.quantity,
      0,
    );

    // (2) OrderItems 가공
    const formattedItems = order.orderItems.map(item => {
      const myReview = item.review;
      const hasReview = !!myReview;

      return {
        id: item.id,
        price: item.price,
        quantity: item.quantity,
        productId: item.productId,
        product: {
          name: item.product.name,
          image: buildFileUrl(item.product.image),
          reviews: myReview
            ? [
                {
                  id: myReview.id,
                  rating: myReview.rating,
                  content: myReview.content,
                  createdAt: myReview.createdAt,
                },
              ]
            : [],
        },
        // ✅ 사이즈 객체 변환
        size: mapSizeToResponse(item.size),
        isReviewed: hasReview,
      };
    });

    // (3) Payments 객체 생성
    const paymentData = {
      id: order.id,
      price: order.totalAmount,
      status: order.status === 'PAID' ? 'CompletedPayment' : order.status,
      createdAt: order.paymentDate || order.createdAt,
      updatedAt: order.createdAt,
      orderId: order.id,
    };

    // 4. 최종 리턴 (요청하신 JSON 포맷과 100% 일치)
    return {
      id: order.id,
      name: order.recipientName,
      phoneNumber: order.recipientPhone,
      address: order.deliveryAddress,
      subtotal: subtotal,
      totalQuantity: totalQuantity,
      usePoint: order.usedPoints,
      createdAt: order.createdAt,
      orderItems: formattedItems,
      payments: paymentData,
    };
  }
  // 주문 정보 수정
  async updatePurchase(
    userId: string,
    purchaseId: string,
    updateData: { name?: string; phone?: string; address?: string },
  ) {
    // 1. 수정 가능한 상태인지 확인
    const existingOrder = await this.prisma.order.findUnique({
      where: { id: purchaseId },
    });

    if (!existingOrder) {
      throw new Error('NOT_FOUND');
    }

    if (existingOrder.userId !== userId) {
      throw new Error('FORBIDDEN');
    }

    // 이미 배송 중이거나 완료된 경우 수정 불가
    if (
      existingOrder.status === 'SHIPPED' ||
      existingOrder.status === 'DELIVERED'
    ) {
      throw new Error('CANNOT_UPDATE'); // 컨트롤러에서 400 or 409 처리
    }

    // ✅ [수정 핵심] undefined가 들어가지 않도록 동적으로 객체를 만듭니다.
    // 값이 있는 것만 이 객체에 담깁니다.
    const updatePayload: any = {};
    if (updateData.name) updatePayload.recipientName = updateData.name;
    if (updateData.phone) updatePayload.recipientPhone = updateData.phone;
    if (updateData.address) updatePayload.deliveryAddress = updateData.address;

    const updatedOrder = await this.prisma.order.update({
      where: { id: purchaseId },
      data: updatePayload, // 👈 여기에 깔끔하게 정리된 객체를 넣습니다.
      include: {
        orderItems: {
          include: {
            product: true,
            review: true,
          },
        },
      },
    });

    // 4. 응답 데이터 가공 (기존 조회 로직과 100% 동일하게 구성)

    // (1) Subtotal 계산
    const subtotal = updatedOrder.orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    const totalQuantity = updatedOrder.orderItems.reduce(
      (acc, item) => acc + item.quantity,
      0,
    );

    // (2) Items 가공
    const formattedItems = updatedOrder.orderItems.map(item => {
      const myReview = item.review;
      const hasReview = !!myReview;

      return {
        id: item.id,
        price: item.price,
        quantity: item.quantity,
        productId: item.productId,
        product: {
          name: item.product.name,
          image: buildFileUrl(item.product.image),
          reviews: myReview
            ? [
                {
                  id: myReview.id,
                  rating: myReview.rating,
                  content: myReview.content,
                  createdAt: myReview.createdAt,
                },
              ]
            : [],
        },
        // 사이즈 문자열 -> 객체 변환
        size: mapSizeToResponse(item.size),
        isReviewed: hasReview,
      };
    });

    // (3) Payments 객체 생성
    const paymentData = {
      id: updatedOrder.id,
      price: updatedOrder.totalAmount,
      status:
        updatedOrder.status === 'PAID'
          ? 'CompletedPayment'
          : updatedOrder.status,
      createdAt: updatedOrder.paymentDate || updatedOrder.createdAt,
      updatedAt: updatedOrder.createdAt,
      orderId: updatedOrder.id,
    };

    // 5. 최종 리턴
    return {
      id: updatedOrder.id,
      name: updatedOrder.recipientName,
      phoneNumber: updatedOrder.recipientPhone,
      address: updatedOrder.deliveryAddress,
      subtotal: subtotal,
      totalQuantity: totalQuantity,
      usePoint: updatedOrder.usedPoints,
      createdAt: updatedOrder.createdAt,
      orderItems: formattedItems,
      payments: paymentData,
    };
  }
  // 5. 주문 취소 (재고 복구 + 포인트 환불)
  async cancelPurchase(userId: string, purchaseId: string) {
    return await this.prisma.$transaction(async tx => {
      // 1. 주문 조회
      const order = await tx.order.findUnique({
        where: { id: purchaseId },
        include: { orderItems: true }, // 재고 복구를 위해 아이템 정보 필요
      });

      if (!order) {
        throw new Error('NOT_FOUND');
      }

      // 2. 권한 및 상태 체크
      if (order.userId !== userId) {
        throw new Error('FORBIDDEN');
      }

      // 이미 배송 중이거나 배송 완료된 상품은 취소 불가
      if (order.status === 'SHIPPED' || order.status === 'DELIVERED') {
        throw new Error('CANNOT_CANCEL'); // 400 or 409
      }

      // 이미 취소된 주문인지 체크 (선택 사항)
      if (order.status === 'CANCELED') {
        throw new Error('ALREADY_CANCELED');
      }

      // 3. 재고 복구 (Loop 돌면서 stock increment)
      for (const item of order.orderItems) {
        // 해당 상품의 사이즈 옵션 ID를 찾아서 수량 증가
        // (주의: ProductStock을 찾기 위해 productId와 size 문자열을 사용)
        await tx.productStock.update({
          where: {
            productId_size: {
              productId: item.productId,
              size: item.size,
            },
          },
          data: {
            quantity: { increment: item.quantity }, // 다시 채워넣음
          },
        });
      }

      // 4. 포인트 환불 (사용한 포인트가 있다면)
      if (order.usedPoints > 0) {
        await tx.userPoint.update({
          where: { userId: userId },
          data: {
            points: { increment: order.usedPoints }, // 차감했던 포인트 다시 증가
            // 등급 산정용 누적 금액도 취소해야 한다면 accumulatedAmount: { decrement: order.totalAmount } 추가 고려
          },
        });
      }

      // 5. 주문 상태 변경 (CANCELED)
      const canceledOrder = await tx.order.update({
        where: { id: purchaseId },
        data: { status: 'CANCELED' },
        include: {
          orderItems: {
            include: {
              product: true,
              review: true,
            },
          },
        },
      });

      // --------------------------------------------------------
      // 6. 응답 데이터 가공 (기존 포맷 유지)
      // --------------------------------------------------------

      const subtotal = canceledOrder.orderItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      );
      const totalQuantity = canceledOrder.orderItems.reduce(
        (acc, item) => acc + item.quantity,
        0,
      );

      const formattedItems = canceledOrder.orderItems.map(item => {
        const myReview = item.review;
        const hasReview = !!myReview;

        return {
          id: item.id,
          price: item.price,
          quantity: item.quantity,
          productId: item.productId,
          product: {
            name: item.product.name,
            image: buildFileUrl(item.product.image),
            reviews: myReview
              ? [
                  {
                    id: myReview.id,
                    rating: myReview.rating,
                    content: myReview.content,
                    createdAt: myReview.createdAt,
                  },
                ]
              : [],
          },
          size: mapSizeToResponse(item.size),
          isReviewed: hasReview,
        };
      });

      const paymentData = {
        id: canceledOrder.id,
        price: canceledOrder.totalAmount,
        status: 'CanceledPayment', // 프론트에 맞춰 상태값 변경 (필요하다면)
        createdAt: canceledOrder.paymentDate || canceledOrder.createdAt,
        updatedAt: canceledOrder.createdAt,
        orderId: canceledOrder.id,
      };

      return {
        id: canceledOrder.id,
        name: canceledOrder.recipientName,
        phoneNumber: canceledOrder.recipientPhone,
        address: canceledOrder.deliveryAddress,
        subtotal: subtotal,
        totalQuantity: totalQuantity,
        usePoint: canceledOrder.usedPoints,
        createdAt: canceledOrder.createdAt,
        orderItems: formattedItems,
        payments: paymentData,
      };
    });
  }
}

export const PurchaseService = new PurchaseServiceClass();
