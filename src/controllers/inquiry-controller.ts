import type { Request, Response, NextFunction } from 'express';
import type {
  FetchInquiriesParamsDto,
  InquiryListResponseDto,
  FetchInquiryDetailParamsDto,
  InquiryDetailResponseDto,
  UpdateInquiryParamsDto,
  CreateInquiryReplyParamsDto,
  UpdateInquiryReplyParamsDto,
} from '../dtos/inquiry.dto.js';
import { InquiryStatus } from '../dtos/inquiry.dto.js';
import { HttpError } from '../common/httpError.js';
import * as inquiryService from '../services/inquiry-services.js';
import type { Create } from 'payload';

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
    const userId = 'abcd1234abcd1234abcd1234'; // TODO: 인증 미들웨어 구현 후 수정 필요
    if (!userId) {
      return next(new HttpError('인증이 필요합니다.', 401));
    }

    // DTO 생성
    const params: FetchInquiriesParamsDto = {
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

    // DTO 생성
    const params: FetchInquiryDetailParamsDto = {
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

  body.inquiryId = inquiryId;

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

  const params = {
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
  const userId = 'abcd1234abcd1234abcd1234'; // TODO: 인증 미들웨어 구현 후 수정 필요
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

  const params: UpdateInquiryReplyParamsDto = {
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
