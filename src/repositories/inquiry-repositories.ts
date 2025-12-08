import type { $Enums } from '@prisma/client';
import { HttpError } from '../common/httpError.js';
import prisma from '../common/prisma.js';
import type {
  GetInquiriesParamsDto,
  InquiryItemDto,
} from '../dtos/inquiry.dto.js';

/**
 * 전달받은 User의 역할 반환
 * @param userId
 * @returns $Enums.UserRole
 */
export const getUserRole = async (userId: string): Promise<$Enums.UserRole> => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      role: true,
    },
  });

  if (!user) {
    throw new Error('사용자를 찾을 수 없습니다.');
  }

  return user.role;
};

/**
 * User 역할에 따른 문의 목록 반환
 * @param params
 * @returns InquiryItemDto[]
 */
export const fetchInquiries = async (
  params: GetInquiriesParamsDto,
): Promise<InquiryItemDto[]> => {
  const { page, pageSize, status, userId, userRole } = params;

  const whereClause: any =
    userRole === 'BUYER'
      ? { userId } // BUYER인 경우 자신의 문의만 조회
      : // SELLER인 경우 판매자의 상품에 대한 문의 조회
        {
          product: {
            store: {
              id: userId,
            },
          },
        };

  prisma.inquiry.findMany({
    where: whereClause,
    select: {
      id: true,
      title: true,
      isSecret: true,
      status: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          image: true,
          store: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      content: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return [];
};

/**
 * User 역할에 따른 전체 문의 개수 반환
 * @param userId string
 * @param userRole $Enums.UserRole
 * @returns
 */
export const countTotalInquiries = async (
  userId: string,
  userRole: $Enums.UserRole,
) => {
  const whereClause: any =
    userRole === 'BUYER'
      ? { userId } // BUYER인 경우 자신의 문의만 조회
      : // SELLER인 경우 판매자의 상품에 대한 문의 조회
        {
          product: {
            store: {
              id: userId,
            },
          },
        };

  const count = await prisma.inquiry.count({
    where: whereClause,
  });

  return count;
};
