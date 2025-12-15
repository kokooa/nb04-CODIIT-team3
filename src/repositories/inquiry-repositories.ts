import type { $Enums } from '@prisma/client';
import { HttpError } from '../common/httpError.js';
import prisma from '../common/prisma.js';
import type {
  FetchInquiriesParamsDto,
  InquiryItemDto,
  FetchInquiryDetailParamsDto,
  InquiryStatus,
  UpdateInquiryParamsDto,
  DeleteInquiryParamsDto,
  CreateInquiryReplyParamsDto,
  UpdateInquiryReplyParamsDto,
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
  params: FetchInquiriesParamsDto,
): Promise<InquiryItemDto[]> => {
  const { page, pageSize, status, userId, userRole } = params;

  const whereClause: any =
    userRole === 'BUYER'
      ? { userId } // BUYER인 경우 자신의 문의만 조회
      : // SELLER인 경우 판매자의 상품에 대한 문의 조회
        {
          product: {
            store: {
              sellerId: userId,
            },
          },
        };

  if (status) {
    whereClause.status = status;
  }

  const inquiries = await prisma.inquiry.findMany({
    where: whereClause,
    select: {
      id: true,
      title: true,
      isSecret: true,
      status: true,
      user: {
        select: {
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

  return inquiries.map(inquiry => ({
    ...inquiry,
    status: inquiry.status as InquiryStatus,
  }));
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
              sellerId: userId,
            },
          },
        };

  const count = await prisma.inquiry.count({
    where: whereClause,
  });

  return count;
};

/**
 * inquiryId로 상세 문의 조회
 * @param inquiryId string
 */
export const fetchInquiryDetailById = async (inquiryId: string) => {
  const inquiry = await prisma.inquiry.findUnique({
    where: {
      id: inquiryId,
    },
    select: {
      id: true,
      userId: true,
      productId: true,
      title: true,
      content: true,
      status: true,
      isSecret: true,
      createdAt: true,
      updatedAt: true,
      product: {
        select: {
          store: {
            select: {
              sellerId: true,
            },
          },
        },
      },
      user: {
        select: {
          name: true,
        },
      },
      reply: {
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          seller: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!inquiry) {
    throw new HttpError('문의가 존재하지 않습니다.', 404);
  }

  return inquiry;
};

/**
 * updateInquiry
 * @param body UpdateInquiryParamsDto
 */
export const updateInquiry = async (body: UpdateInquiryParamsDto) => {
  const { title, content, isSecret } = body;

  const inquiryUpdated = await prisma.inquiry.update({
    where: {
      id: body.inquiryId,
    },
    data: {
      title,
      content,
      isSecret,
    },
  });

  return inquiryUpdated;
};

/**
 * deleteInquiry
 * @param params DeleteInquiryParamsDto
 */
export const deleteInquiry = async (params: DeleteInquiryParamsDto) => {
  const { inquiryId } = params;

  const deletedInquiry = await prisma.inquiry.delete({
    where: {
      id: inquiryId,
    },
  });

  return deletedInquiry;
};

/**
 * createInquiryReply
 * @param body CreateInquiryReplyParamsDto
 */
export const createInquiryReply = async (body: CreateInquiryReplyParamsDto) => {
  const createdInquiry = await prisma.inquiryReply.create({
    data: {
      inquiryId: body.inquiryId,
      sellerId: body.userId,
      content: body.content,
    },
  });

  return createdInquiry;
};

/**
 * fetchUserById
 * @param userId string
 */
export const fetchUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new HttpError('사용자가 존재하지 않습니다.', 404);
  }

  return user;
};

/**
 * updateInquiryReply
 * @param params UpdateInquiryReplyParamsDto
 */
export const updateInquiryReply = async (
  params: UpdateInquiryReplyParamsDto,
) => {
  const { replyId, content } = params;

  const updatedInquiryReply = await prisma.inquiryReply.update({
    where: {
      id: replyId,
    },
    data: {
      content,
    },
  });

  return updatedInquiryReply;
};
