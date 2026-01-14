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
// 알림 서비스 연동
import { NotificationService } from './notification-service.js';

const notificationService = new NotificationService();

/**
 * [공통] 응답 데이터 포맷팅 함수 (코드 중복 제거)
 */
const formatInquiryResponse = (inquiry: any) => {
  if (!inquiry) return null;
  const { reply, status, ...restItem } = inquiry;

  if (!reply) {
    return { ...restItem, status: status as InquiryStatus, reply: null };
  }

  const { seller, sellerId, ...restReply } = reply;
  return {
    ...restItem,
    status: status as InquiryStatus,
    reply: { ...restReply, userId: sellerId, user: seller },
  };
};

/**
 * 내 문의 조회 (판매자, 구매자 공용)
 */
export const getInquiries = async (
  params: Omit<FetchInquiriesParamsDto, 'userRole'>,
): Promise<InquiryListResponseDto> => {
  const userRole = await inquiryRepository.getUserRole(params.userId);
  const fetchParams = { ...params, userRole };

  const inquiryItems = await inquiryRepository.fetchInquiries(fetchParams);
  const totalCount = await inquiryRepository.countTotalInquiries(
    params.userId,
    userRole,
  );

  return {
    list: inquiryItems.map(item => formatInquiryResponse(item)),
    totalCount,
  };
};

/**
 * 문의 상세 조회 (비밀글 권한 체크 포함)
 */
export const getInquiryDetail = async (
  params: FetchInquiryDetailParamsDto,
): Promise<InquiryDetailResponseDto> => {
  const { userId, inquiryId } = params;
  const inquiryDetail =
    await inquiryRepository.fetchInquiryDetailById(inquiryId);

  // 비밀글 권한 체크: 작성자 본인 혹은 해당 상품의 판매자(관리자)만 가능
  if (
    inquiryDetail.isSecret &&
    inquiryDetail.userId !== userId &&
    inquiryDetail.product.store.sellerId !== userId
  ) {
    throw new HttpError(
      '비밀글입니다. 작성자와 판매자만 조회할 수 있습니다.',
      403,
    );
  }

  return formatInquiryResponse(inquiryDetail) as InquiryDetailResponseDto;
};

/**
 * 문의 수정
 */
export const updateInquiry = async (
  body: UpdateInquiryParamsDto,
): Promise<UpdateInquiryResponseDto> => {
  const inquiry = await inquiryRepository.fetchInquiryDetailById(
    body.inquiryId,
  );

  if (inquiry.userId !== body.userId) {
    throw new HttpError('본인의 문의만 수정할 수 있습니다.', 403);
  }

  if (inquiry.reply) {
    throw new HttpError('이미 답변이 달린 문의는 수정할 수 없습니다.', 400);
  }

  const updatedInquiry = await inquiryRepository.updateInquiry(body);
  return formatInquiryResponse(updatedInquiry) as UpdateInquiryResponseDto;
};

/**
 * 문의 삭제
 */
export const deleteInquiry = async (
  params: DeleteInquiryParamsDto,
): Promise<DeleteInquiryResponseDto> => {
  const inquiry = await inquiryRepository.fetchInquiryDetailById(
    params.inquiryId,
  );

  if (inquiry.userId !== params.userId) {
    throw new HttpError('본인의 문의만 삭제할 수 있습니다.', 403);
  }

  const deletedInquiry = await inquiryRepository.deleteInquiry(params);
  return formatInquiryResponse(deletedInquiry) as DeleteInquiryResponseDto;
};

/**
 * 문의 답변 생성 (알림 연동 포함)
 */
export const createInquiryReply = async (
  body: CreateInquiryReplyParamsDto,
): Promise<CreateInquiryReplyResponseDto> => {
  const inquiry = await inquiryRepository.fetchInquiryDetailById(
    body.inquiryId,
  );

  if (inquiry.product.store.sellerId !== body.userId) {
    throw new HttpError('해당 문의에 대한 답변 권한이 없습니다.', 403);
  }

  if (inquiry.reply) {
    throw new HttpError('이미 답변이 완료된 문의입니다.', 409);
  }

  const createdInquiryReply = await inquiryRepository.createInquiryReply(body);

  // 보강: 구매자에게 알림 발송
  notificationService
    .createInquiryReplyNotification(
      inquiry.userId,
      (inquiry.product as any).name || '문의 상품',
    )
    .catch(err => console.error('Notification Error:', err));

  return {
    ...createdInquiryReply,
    userId: createdInquiryReply.sellerId,
  };
};

/**
 * 문의 답변 수정
 */
export const updateInquiryReply = async (
  params: UpdateInquiryReplyParamsDto,
): Promise<UpdateInquiryReplyResponseDto> => {
  const reply = await inquiryRepository.fetchInquiryReplyById(params.replyId);

  if (reply.sellerId !== params.userId) {
    throw new HttpError('본인의 답변만 수정할 수 있습니다.', 403);
  }

  const updatedInquiryReply =
    await inquiryRepository.updateInquiryReply(params);

  return {
    ...updatedInquiryReply,
    userId: updatedInquiryReply.sellerId,
  };
};

/**
 * 상품별 문의 목록 조회
 */
export const getInquiriesForProduct = async (
  params: FetchInquiriesForProductParamsDto,
): Promise<InquiryListForProductResponseDto> => {
  const inquiryItems = await inquiryRepository.fetchInquiriesForProduct(params);
  const totalCount =
    await inquiryRepository.countTotalInquiriesForProduct(params);

  return {
    list: inquiryItems.map(item => formatInquiryResponse(item)),
    totalCount,
  };
};

/**
 * 상품 문의 등록
 */
export const createInquiryForProduct = async (
  params: CreateInquiryForProductParamsDto,
): Promise<CreateInquiryForProductResponseDto> => {
  const createdInquiry =
    await inquiryRepository.createInquiryForProduct(params);

  if (!createdInquiry) {
    throw new HttpError('문의 생성에 실패했습니다.', 500);
  }

  return formatInquiryResponse(
    createdInquiry,
  ) as CreateInquiryForProductResponseDto;
};
