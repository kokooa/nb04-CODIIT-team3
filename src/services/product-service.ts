import { ProductRepository } from '../repositories/product-repository.js';
import type {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
} from '../dtos/product-dto.js';
import { buildFileUrl } from '../common/uploads.js';

const SIZE_STRING_TO_ID: { [key: string]: number } = {
  Free: 1,
  XS: 2,
  S: 3,
  M: 4,
  L: 5,
  XL: 6,
  '2XL': 7,
};

export class ProductService {
  private productRepository = new ProductRepository();

  async createProduct(body: any) {
    const categoryInput = body.category || body.categoryName;

    if (!categoryInput) {
      throw new Error('필수 입력값인 category가 누락되었습니다.');
    }

    const SIZE_MAPPING: { [key: number]: string } = {
      1: 'XS',
      2: 'S',
      3: 'M',
      4: 'L',
      5: 'XL',
      6: 'Free',
    };

    let stockList = body.stocks;
    if (typeof stockList === 'string') {
      try {
        stockList = JSON.parse(stockList);
      } catch (e) {
        stockList = [];
      }
    }

    const stockData = Array.isArray(stockList)
      ? stockList.map((s: any) => {
          let resolvedSize = SIZE_MAPPING[Number(s.sizeId)];

          if (!resolvedSize) {
            resolvedSize = s.size || s.sized || s.name || s.sizeId || 'Free';
          }

          return {
            size: String(resolvedSize),
            quantity: Number(s.quantity),
          };
        })
      : [];

    const createData = {
      name: body.name,
      price: Number(body.price),
      detailInfo: body.content || body.detailInfo,
      image: body.image,
      category: categoryInput.toUpperCase(),
      storeId: body.storeId,
      discountPrice: body.discountPrice ? Number(body.discountPrice) : null,
      discountStart: body.discountStartTime
        ? new Date(body.discountStartTime)
        : null,
      discountEnd: body.discountEndTime ? new Date(body.discountEndTime) : null,

      stocks: stockData,
    };

    const product = await this.productRepository.createProduct(createData);

    const calculatedRate =
      product.price > 0 && product.discountPrice
        ? Math.round(
            ((product.price - product.discountPrice) / product.price) * 100,
          )
        : 0;

    const totalStock = product.stocks.reduce(
      (acc: number, cur: any) => acc + cur.quantity,
      0,
    );

    return {
      id: product.id,
      name: product.name,
      image: buildFileUrl(product.image),
      content: product.detailInfo,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      reviewsRating: 0.0,
      storeId: product.storeId,
      storeName: product.store?.name || '상점명',
      price: product.price,
      discountPrice: product.discountPrice || product.price,
      discountRate: calculatedRate,
      discountStartTime: product.discountStart,
      discountEndTime: product.discountEnd,
      reviewsCount: 0,
      reviews: {
        rate1Length: 0,
        rate2Length: 0,
        rate3Length: 0,
        rate4Length: 0,
        rate5Length: 0,
        sumScore: 0,
      },
      inquiries: [],
      categoryId: 'CUID',
      category: {
        name: product.category.toLowerCase(),
        id: 'CUID',
      },
      stocks: product.stocks.map((s: any) => ({
        id: s.id,
        productId: s.productId,
        quantity: s.quantity,
        size: {
          id: 0,
          name: s.size,
        },
      })),
      isSoldOut: totalStock === 0,
    };
  }

  async getProducts(query: any) {
    // 1. 페이지네이션 및 필터 처리
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    // 정렬 조건 (기본값: 최신순)
    const orderBy = { createdAt: 'desc' as const };

    // 검색 조건 (예: 카테고리, 검색어 등 필요 시 추가)
    const where: any = {};
    if (query.category) {
      where.category = query.category.toUpperCase(); // Enum 매칭
    }
    // TODO: 검색어(keyword) 로직이 필요하면 여기에 where.name = { contains: ... } 추가

    // 2. Repository 호출
    const { products, totalCount } = await this.productRepository.getProducts(
      skip,
      pageSize,
      where,
      orderBy,
    );

    // 3. 응답 양식에 맞게 데이터 가공 (Mapping)
    const list = products.map(product => {
      // (1) 할인율 계산
      let discountRate = 0;
      if (product.price > 0 && product.discountPrice) {
        discountRate = Math.round(
          ((product.price - product.discountPrice) / product.price) * 100,
        );
      }

      // (2) 품절 여부 확인 (모든 옵션의 재고 합이 0이면 품절)
      const totalStockQuantity = product.stocks.reduce(
        (sum, stock) => sum + stock.quantity,
        0,
      );
      const isSoldOut = totalStockQuantity === 0;

      // (3) 리뷰 평점 평균 계산
      // 주의: Review 모델에 rating 필드가 있다고 가정합니다. 없다면 0 처리.
      const reviewsCount = product.reviews.length;
      const reviewsRating =
        reviewsCount > 0
          ? product.reviews.reduce((sum, r: any) => sum + (r.rating || 0), 0) /
            reviewsCount
          : 0;

      return {
        id: product.id,
        storeId: product.storeId,
        storeName: product.store?.name || '알 수 없음',
        name: product.name,
        image: buildFileUrl(product.image),
        price: product.price,
        discountPrice: product.discountPrice || product.price, // 할인가 없으면 정가
        discountRate: discountRate,
        discountStartTime: product.discountStart,
        discountEndTime: product.discountEnd,
        reviewsCount: reviewsCount,
        reviewsRating: Number(reviewsRating.toFixed(1)), // 소수점 1자리까지
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        sales: product.totalSales, // 스키마의 totalSales -> 응답의 sales
        isSoldOut: isSoldOut,
      };
    });

    // 4. 최종 리턴
    return {
      list,
      totalCount,
    };
  }

  async updateProduct(productId: string, body: UpdateProductDto) {
    const {
      name,
      price,
      content,
      image,
      discountRate,
      discountStartTime,
      discountEndTime,
      categoryName,
      isSoldOut,
      stocks,
    } = body;

    const data: any = {
      name,
      price,
      content,
      image,
      discountRate,
      discountStartTime: discountStartTime
        ? new Date(discountStartTime)
        : undefined,
      discountEndTime: discountEndTime ? new Date(discountEndTime) : undefined,
      categoryName,
      isSoldOut,
    };

    if (stocks) {
      await this.productRepository.deleteStocksByProduct(productId);
      data.stocks = {
        create: stocks.map(s => ({
          size: s.size,
          quantity: s.quantity,
        })),
      };
    }

    return this.productRepository.updateProduct(productId, data);
  }

  async getProductById(productId: string) {
    // 1. DB 조회
    const product = await this.productRepository.getProductById(productId);

    if (!product) {
      throw { statusCode: 404, message: '상품을 찾을 수 없습니다.' };
    }

    // 2. 할인율 계산
    let discountRate = 0;
    if (product.price > 0 && product.discountPrice) {
      discountRate = Math.round(
        ((product.price - product.discountPrice) / product.price) * 100,
      );
    }

    // 3. 리뷰 통계 계산 (rate1Length ~ rate5Length)
    const reviewStats = {
      rate1Length: 0,
      rate2Length: 0,
      rate3Length: 0,
      rate4Length: 0,
      rate5Length: 0,
      sumScore: 0,
    };

    product.reviews.forEach(review => {
      // review.rating이 1~5라고 가정
      const rating = review.rating || 0;
      reviewStats.sumScore += rating;

      if (rating === 1) reviewStats.rate1Length++;
      else if (rating === 2) reviewStats.rate2Length++;
      else if (rating === 3) reviewStats.rate3Length++;
      else if (rating === 4) reviewStats.rate4Length++;
      else if (rating === 5) reviewStats.rate5Length++;
    });

    const reviewsCount = product.reviews.length;
    const reviewsRating =
      reviewsCount > 0
        ? Number((reviewStats.sumScore / reviewsCount).toFixed(1))
        : 0;

    // 3. 품절 여부 계산 (stocks 합계)
    const totalStockQuantity = product.stocks.reduce(
      (sum: number, stock: any) => sum + stock.quantity,
      0,
    );
    const isSoldOut = totalStockQuantity === 0;

    // 4. 최종 Response Mapping
    return {
      id: product.id,
      name: product.name,
      image: buildFileUrl(product.image),
      content: product.detailInfo, // DB: detailInfo -> Res: content
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,

      reviewsRating: reviewsRating,
      reviewsCount: reviewsCount,
      // 요청하신 대로 통계 객체를 배열 안에 넣음
      reviews: reviewStats,

      storeId: product.storeId,
      storeName: product.store?.name || '알 수 없음',

      price: product.price,
      discountPrice: product.discountPrice || product.price,
      discountRate: discountRate,
      discountStartTime: product.discountStart,
      discountEndTime: product.discountEnd,

      // 문의 내역 매핑
      inquiries: product.inquiries.map(inquiry => ({
        id: inquiry.id,
        title: inquiry.title || '상품 문의', // 스키마에 title 없으면 기본값
        content: inquiry.content,
        status: inquiry.reply ? 'CompletedAnswer' : 'Waiting', // 답변 유무로 상태 결정
        isSecret: inquiry.isSecret || false,
        createdAt: inquiry.createdAt,
        updatedAt: inquiry.updatedAt,
        reply: inquiry.reply
          ? {
              id: inquiry.reply.id,
              content: inquiry.reply.content,
              createdAt: inquiry.reply.createdAt,
              updatedAt: inquiry.reply.updatedAt,
              user: inquiry.reply.seller
                ? {
                    id: inquiry.reply.seller.id,
                    name: inquiry.reply.seller.name || '판매자',
                  }
                : null,
            }
          : null,
      })),

      categoryId: 'CUID',
      category: {
        name:
          typeof product.category === 'string'
            ? product.category.toLowerCase()
            : 'etc',
        id: 'CUID',
      },

      stocks: product.stocks.map(stock => {
        // null 안전 처리
        const sizeStr = stock.size || 'Free';
        // 'S'는 무조건 3, 'L'은 무조건 5로 변환 (맵에 없으면 99)
        const fixedId = SIZE_STRING_TO_ID[sizeStr] || 99;

        return {
          id: stock.id,
          productId: stock.productId,
          quantity: stock.quantity,
          size: {
            id: fixedId, // 👈 고정된 ID 부여 (선택 로직 꼬임 방지)
            name: sizeStr, // 👈 프론트엔드가 찾는 name 속성 제공 (Free 표시 방지)
          },
        };
      }),
      isSoldOut: isSoldOut,
    };
  }

  async deleteProduct(productId: string) {
    // 1. (권장) 삭제 전에 상품이 존재하는지 먼저 확인
    // Repository에 findById 같은 조회 메서드가 있다고 가정합니다.
    const existingProduct =
      await this.productRepository.findProductById(productId);

    if (!existingProduct) {
      // 상품이 없으면 에러를 던짐 (메시지는 컨트롤러에서 구분하기 위함)
      throw new Error('NOT_FOUND');
    }

    // 2. 존재하면 삭제 진행
    return this.productRepository.deleteProduct(productId);
  }
}
