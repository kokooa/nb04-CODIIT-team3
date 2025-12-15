import type {
  FetchInquiriesParamsDto,
  InquiryItemDto,
  InquiryListResponseDto,
  FetchInquiryDetailParamsDto,
  InquiryDetailResponseDto,
  InquiryStatus,
  UpdateInquiryParamsDto,
  UpdateInquiryResponseDto,
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
 * @returns inquiryUpdated UpdateInquiryResponseDto
 */
export const updateInquiry = async (
  body: UpdateInquiryParamsDto,
): Promise<UpdateInquiryResponseDto> => {
  // const { title, content, isSecret } = body;

  const inquiryUpdated = await inquiryRepository.updateInquiry(body);

  const { status, ...rest } = inquiryUpdated;

  return { status: status as InquiryStatus, ...rest };
};
