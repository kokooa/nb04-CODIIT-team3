import { HttpError } from '../common/http-error.js';
import type {
  FetchInquiriesParamsDto,
  InquiryListResponseDto,
  FetchInquiryDetailParamsDto,
  InquiryDetailResponseDto,
  InquiryStatus,
  UpdateInquiryParamsDto,
  UpdateInquiryResponseDto,
  DeleteInquiryParamsDto,
  DeleteInquiryResponseDto,
  CreateInquiryReplyParamsDto,
  CreateInquiryReplyResponseDto,
  UpdateInquiryReplyParamsDto,
  UpdateInquiryReplyResponseDto,
  FetchInquiriesForProductParamsDto,
  InquiryListForProductResponseDto,
  CreateInquiryForProductParamsDto,
  CreateInquiryForProductResponseDto,
} from '../dtos/inquiry.dto.js';
import * as inquiryRepository from '../repositories/inquiry-repository.js';

/**
 * 내 문의 조회 (판매자, 구매자 공용)
 * @param params
 * @returns
 */
export const getInquiries = async (
  params: Omit<FetchInquiriesParamsDto, 'userRole'>,
): Promise<InquiryListResponseDto> => {
  // const { page, pageSize, status, userId } = params;

  // 사용자 역할 받아오기
  const userRole = await inquiryRepository.getUserRole(params.userId);

  // params에 userRole 추가
  const fetchParams = { ...params, userRole };

  // 문의 목록 받아오기
  const inquiryItems = await inquiryRepository.fetchInquiries(fetchParams);

  const totalCount = await inquiryRepository.countTotalInquiries(
    params.userId,
    userRole,
  );

  return {
    list: inquiryItems,
    totalCount,
  };
};

/**
 * getInquiryDetail
 * @param params FetchInquiryDetailParamsDto
 */
export const getInquiryDetail = async (
  params: FetchInquiryDetailParamsDto,
): Promise<InquiryDetailResponseDto> => {
  const { userId, inquiryId } = params;

  const inquiryDetail =
    await inquiryRepository.fetchInquiryDetailById(inquiryId);

  // 비밀글이면 구매자/판매자만 조회 가능
  if (
    inquiryDetail.isSecret &&
    inquiryDetail.userId !== userId &&
    inquiryDetail.product.store.sellerId !== userId
  ) {
    /* console.log(
      '비밀글 접근 차단\nisSecret:',
      inquiryDetail.isSecret,
      '\nuserId:',
      inquiryDetail.userId,
      ':',
      userId,
      '\nsellerId:',
      inquiryDetail.product.store.sellerId,
      ':',
      userId,
    ); */
    throw new HttpError('비밀글입니다.', 403);
  }

  const { reply, user, status, product, ...rest } = inquiryDetail;

  if (reply) {
    const { seller, ...replyRest } = reply;
    return {
      ...rest,
      status: status as InquiryStatus,
      reply: {
        ...replyRest,
        user: seller,
      },
    };
  }

  return { ...rest, status: status as InquiryStatus };
};

/**
 * updateInquiry
 * @param body UpdateInquiryParamsDto
 * @returns UpdateInquiryResponseDto
 */
export const updateInquiry = async (
  body: UpdateInquiryParamsDto,
): Promise<UpdateInquiryResponseDto> => {
  // 문의 존재 여부 및 답변 여부 확인
  const inquiry = await inquiryRepository.fetchInquiryDetailById(
    body.inquiryId,
  );

  // 권한 확인
  if (inquiry.userId !== body.userId) {
    throw new HttpError('본인의 문의만 수정할 수 있습니다.', 403);
  }

  // 이미 답변이 달린 문의면 수정 불가
  if (inquiry.reply) {
    throw new HttpError('이미 답변이 달린 문의입니다.', 400);
  }

  const updatedInquiry = await inquiryRepository.updateInquiry(body);
  const { status, reply, ...rest } = updatedInquiry;

  if (reply) {
    const { seller, ...replyRest } = reply;
    const replyResult = {
      ...replyRest,
      user: seller,
    };

    return { status: status as InquiryStatus, reply: replyResult, ...rest };
  }

  return { status: status as InquiryStatus, ...rest };
};

/**
 * deleteInquiry
 * @param params DeleteInquiryParamsDto
 * @returns DeleteInquiryResponseDto
 */
export const deleteInquiry = async (
  params: DeleteInquiryParamsDto,
): Promise<DeleteInquiryResponseDto> => {
  // 문의 존재 여부 확인
  const inquiry = await inquiryRepository.fetchInquiryDetailById(
    params.inquiryId,
  );

  // 권한 확인
  if (inquiry.userId !== params.userId) {
    throw new HttpError('본인의 문의만 삭제할 수 있습니다.', 403);
  }

  const deletedInquiry = await inquiryRepository.deleteInquiry(params);

  const { status, reply, ...rest } = deletedInquiry;

  if (reply) {
    const { seller, ...replyRest } = reply;
    const replyResult = {
      ...replyRest,
      user: seller,
    };

    return { status: status as InquiryStatus, reply: replyResult, ...rest };
  }

  return { status: status as InquiryStatus, ...rest };
};

/**
 * createInquiryReply
 * @param body CreateInquiryReplyParamsDto
 * @returns CreateInquiryReplyResponseDto
 */
export const createInquiryReply = async (
  body: CreateInquiryReplyParamsDto,
): Promise<CreateInquiryReplyResponseDto> => {
  // 문의 존재 여부 확인
  const inquiry = await inquiryRepository.fetchInquiryDetailById(
    body.inquiryId,
  );

  // 권한 확인: 해당 상품의 판매자인지 확인
  if (inquiry.product.store.sellerId !== body.userId) {
    throw new HttpError('해당 문의에 대한 답변 권한이 없습니다.', 403);
  }

  // 이미 답변이 있는지 확인
  if (inquiry.reply) {
    throw new HttpError('이미 답변이 완료된 문의입니다.', 409);
  }

  // 문의 답변 생성
  const createdInquiryReply = await inquiryRepository.createInquiryReply(body);
  const { sellerId, ...restCreatedInquiry } = createdInquiryReply;

  const result: CreateInquiryReplyResponseDto = {
    ...restCreatedInquiry,
    userId: sellerId,
  };

  return result;
};

/**
 * updateInquiryReply
 * @param params UpdateInquiryReplyParamsDto
 * @returns UpdateInquiryReplyResponseDto
 */
export const updateInquiryReply = async (
  params: UpdateInquiryReplyParamsDto,
): Promise<UpdateInquiryReplyResponseDto> => {
  // 답변 존재 여부 확인
  const reply = await inquiryRepository.fetchInquiryReplyById(params.replyId);

  // 권한 확인: 본인의 답변인지 확인
  if (reply.sellerId !== params.userId) {
    throw new HttpError('본인의 답변만 수정할 수 있습니다.', 403);
  }

  const updatedInquiryReply =
    await inquiryRepository.updateInquiryReply(params);

  const { sellerId, ...rest } = updatedInquiryReply;

  const result: UpdateInquiryReplyResponseDto = {
    ...rest,
    userId: sellerId,
  };

  return result;
};

/************************************************************/

export const getInquiriesForProduct = async (
  params: FetchInquiriesForProductParamsDto,
): Promise<InquiryListForProductResponseDto> => {
  // const { page, pageSize, productId, sort, status } = params;

  // 문의 목록 받아오기
  const inquiryItems = await inquiryRepository.fetchInquiriesForProduct(params);
  const newInquiryItems = inquiryItems.map(item => {
    const { reply, status, ...restItem } = item;

    if (!reply) {
      return { ...restItem, status: status as InquiryStatus, reply: null };
    }

    const { seller, sellerId, ...restReply } = reply;
    return {
      ...restItem,
      status: status as InquiryStatus,
      reply: { ...restReply, userId: sellerId, user: seller },
    };
  });

  const totalCount =
    await inquiryRepository.countTotalInquiriesForProduct(params);

  return {
    list: newInquiryItems,
    totalCount,
  };
};

export const createInquiryForProduct = async (
  params: CreateInquiryForProductParamsDto,
): Promise<CreateInquiryForProductResponseDto> => {
  const createdInquiry =
    await inquiryRepository.createInquiryForProduct(params);

  if (!createdInquiry) {
    throw new HttpError('문의 생성에 실패했습니다.', 500);
  }

  return {
    ...createdInquiry,
    status: createdInquiry.status as InquiryStatus,
  };
};
