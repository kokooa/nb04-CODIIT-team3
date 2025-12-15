import type {
  FetchInquiriesParamsDto,
  InquiryItemDto,
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
} from '../dtos/inquiry.dto.js';
import * as inquiryRepository from '../repositories/inquiry-repositories.js';

/**
 * 내 문의 조회 (판매자, 구매자 공용)
 * @param params
 * @returns
 */
export const getInquiries = async (
  params: FetchInquiriesParamsDto,
): Promise<InquiryListResponseDto> => {
  // const { page, pageSize, status, userId } = params;

  // 사용자 역할 받아오기
  const userRole = await inquiryRepository.getUserRole(params.userId);

  // params에 userRole 추가
  params.userRole = userRole;
  /* params = {
    ...params,
    userRole,
  }; */

  // 문의 목록 받아오기
  const inquiryItems: InquiryItemDto[] =
    await inquiryRepository.fetchInquiries(params);

  const totalCount = await inquiryRepository.countTotalInquiries(
    params.userId,
    params.userRole,
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
  const inquiryDetail = await inquiryRepository.fetchInquiryDetailById(params);

  const { reply, status, ...rest } = inquiryDetail;

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
  // const { title, content, isSecret } = body;

  const updatedInquiry = await inquiryRepository.updateInquiry(body);

  const { status, ...rest } = updatedInquiry;

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
  const deletedInquiry = await inquiryRepository.deleteInquiry(params);

  const { status, ...rest } = deletedInquiry;

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
  // const { inquiryId, content } = body;

  // 문의 답변 생성
  const createdInquiryReply = await inquiryRepository.createInquiryReply(body);
  const { sellerId, ...restCreatedInquiry } = createdInquiryReply;

  // 답변자 정보 받아오기
  const userInfo = await inquiryRepository.fetchUserById(sellerId);

  const result: CreateInquiryReplyResponseDto = {
    ...restCreatedInquiry,
    userId: sellerId,
    user: {
      id: userInfo.id,
      name: userInfo.name,
    },
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
  const updatedInquiryReply =
    await inquiryRepository.updateInquiryReply(params);

  const { sellerId, ...rest } = updatedInquiryReply;

  // 답변자 정보 받아오기
  const userInfo = await inquiryRepository.fetchUserById(sellerId);

  const result: UpdateInquiryReplyResponseDto = {
    ...rest,
    userId: sellerId,
    user: {
      id: userInfo.id,
      name: userInfo.name,
    },
  };

  return result;
};
