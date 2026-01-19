import type { Request, Response, NextFunction } from 'express';
import type {
  FetchInquiriesParamsDto,
  InquiryListResponseDto,
  FetchInquiryDetailParamsDto,
  InquiryDetailResponseDto,
  UpdateInquiryParamsDto,
  CreateInquiryReplyParamsDto,
  UpdateInquiryReplyParamsDto,
  DeleteInquiryParamsDto,
  FetchInquiriesForProductParamsDto,
  InquiryListForProductResponseDto,
  CreateInquiryForProductParamsDto,
  CreateInquiryForProductResponseDto,
} from '../dtos/inquiry.dto.js';
import { InquiryStatus } from '../dtos/inquiry.dto.js';
import { HttpError } from '../common/http-error.js';
import * as inquiryService from '../services/inquiry-service.js';
import { NotificationService } from '../services/notification-service.js';

const notificationService = new NotificationService();

/**
 * 내 문의 조회 (판매자, 구매자 공용)
 * getInquiries query parameters
 * @param page number
 * @param pageSize number
 * @param status? string: 'WaitingAnswer' | 'CompletedAnswer'
 */
export const getInquiries = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, pageSize, status } = req.query as {
      page: string;
      pageSize: string;
      status?: InquiryStatus;
    };

    // status 값 유효성 검증
    if (status && !Object.values(InquiryStatus).includes(status)) {
      return next(new HttpError('유효하지 않은 status 값입니다.', 400));
    }

    // User 정보 받아오기 및 유효성 검증
    const userId = req.user?.id;
    if (!userId) {
      return next(new HttpError('인증이 필요합니다.', 401));
    }

    // DTO 생성
    const params: Omit<FetchInquiriesParamsDto, 'userRole'> = {
      page: parseInt(page || '1', 10) || 1,
      pageSize: parseInt(pageSize || '10', 10) || 10,
      userId,
      ...(status && { status }),
    };

    // InquiryListResponseDto 받아오기
    const result: InquiryListResponseDto =
      await inquiryService.getInquiries(params);

    // 응답 반환
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * 문의 상세 조회
 * getInquiries query parameters
 * @param inquiryId string
 */
export const getInquiryDetail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { inquiryId } = req.params;

    // 파라미터 유효성 검증
    if (!inquiryId || inquiryId.trim() === '') {
      return next(new HttpError('inquiryId가 없거나 잘못되었습니다.', 400));
    }

    // User 정보 받아오기 및 유효성 검증
    let userId = undefined;
    userId = req.user?.id;
    /* if (!userId) {
      return next(new HttpError('인증이 필요합니다.', 401));
    } */

    // DTO 생성
    const params: FetchInquiryDetailParamsDto = {
      userId,
      inquiryId,
    };

    // 문의 상세 조회
    const result: InquiryDetailResponseDto =
      await inquiryService.getInquiryDetail(params);

    // 응답 반환
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * 문의 수정
 * @param inquiryId string
 * @body title, content, isSecret
 */
export const updateInquiry = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const body = req.body as UpdateInquiryParamsDto;
  const { inquiryId } = req.params;

  // 파라미터 유효성 검증
  if (!inquiryId) {
    return next(new HttpError('inquiryId가 없거나 잘못되었습니다.', 400));
  }

  // User 정보 받아오기 및 유효성 검증
  const userId = req.user?.id;
  if (!userId) {
    return next(new HttpError('인증이 필요합니다.', 401));
  }

  body.inquiryId = inquiryId;
  body.userId = userId;

  try {
    const result = await inquiryService.updateInquiry(body);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * 문의 삭제
 * @param inquiryId string
 */
export const deleteInquiry = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { inquiryId } = req.params;

  // 파라미터 유효성 검증
  if (!inquiryId) {
    return next(new HttpError('inquiryId가 없거나 잘못되었습니다.', 400));
  }

  // User 정보 받아오기 및 유효성 검증
  const userId = req.user?.id;
  if (!userId) {
    return next(new HttpError('인증이 필요합니다.', 401));
  }

  const params: DeleteInquiryParamsDto = {
    userId,
    inquiryId,
  };

  try {
    const result = await inquiryService.deleteInquiry(params);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/* export const getInquiryReplyDetail = (req: Request, res: Response) => {
  // 문의 답변 상세 조회
}; */

/**
 * createInquiryReply
 * @param body CreateInquiryReplyParamsDto
 * @param inquiryId string
 */
export const createInquiryReply = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const body = req.body as CreateInquiryReplyParamsDto;
  const { inquiryId } = req.params;

  // 파라미터 유효성 검증
  if (!inquiryId) {
    return next(new HttpError('inquiryId가 없거나 잘못되었습니다.', 400));
  }

  // User 정보 받아오기 및 유효성 검증
  const userId = req.user?.id;
  if (!userId) {
    return next(new HttpError('인증이 필요합니다.', 401));
  }

  body.inquiryId = inquiryId;
  body.userId = userId;

  try {
    const result = await inquiryService.createInquiryReply(body);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * updateInquiryReply
 * @param content string
 * @param replyId string
 */
export const updateInquiryReply = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { content } = req.body as {
    content: string;
  };
  const { replyId } = req.params;

  // 파라미터 유효성 검증
  if (!replyId) {
    return next(new HttpError('replyId가 없거나 잘못되었습니다.', 400));
  }

  // User 정보 받아오기 및 유효성 검증
  const userId = req.user?.id;
  if (!userId) {
    return next(new HttpError('인증이 필요합니다.', 401));
  }

  const params: UpdateInquiryReplyParamsDto = {
    userId,
    replyId,
    content,
  };

  try {
    const result = await inquiryService.updateInquiryReply(params);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/************************************ For product route **************************************/

export const getInquiriesForProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params;

    const { page, pageSize, sort, status } = req.query as {
      page: string;
      pageSize: string;
      sort: string;
      status: InquiryStatus;
    };

    // 파라미터 유효성 검증
    if (!productId || productId.trim() === '') {
      return next(new HttpError('productId가 없거나 잘못되었습니다.', 400));
    }

    // DTO 생성
    const params: FetchInquiriesForProductParamsDto = {
      productId,
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 10,
      sort,
      status,
    };

    // InquiryListResponseDto 받아오기
    const result: InquiryListForProductResponseDto =
      await inquiryService.getInquiriesForProduct(params);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createInquiryForProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params;

    const { title, content, isSecret } = req.body as {
      title: string;
      content: string;
      isSecret: boolean;
    };

    // 파라미터 유효성 검증
    if (!productId || productId.trim() === '') {
      return next(new HttpError('productId가 없거나 잘못되었습니다.', 400));
    }

    // User 정보 받아오기 및 유효성 검증
    const userId = req.user?.id;
    if (!userId) {
      return next(new HttpError('인증이 필요합니다.', 401));
    }

    // DTO 생성
    const params: CreateInquiryForProductParamsDto = {
      productId,
      userId,
      title,
      content,
      isSecret,
    };

    // InquiryListResponseDto 받아오기
    const result: CreateInquiryForProductResponseDto =
      await inquiryService.createInquiryForProduct(params);

    // 문의 생성 후 알림 생성
    notificationService
      .createInquiryReplyNotification(result.userId, result.title)
      .catch(err => console.error('Notification Error:', err));

    // 응답 반환
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};
