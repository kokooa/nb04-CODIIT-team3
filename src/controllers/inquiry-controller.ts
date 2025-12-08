import type { Request, Response, NextFunction } from 'express';
import type {
  GetInquiriesParamsDto,
  InquiryListResponseDto,
} from '../dtos/inquiry.dto.js';
import { InquiryStatus } from '../dtos/inquiry.dto.js';
import { HttpError } from '../common/httpError.js';
import * as inquiryService from '../services/inquiry-services.js';

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
    const params: GetInquiriesParamsDto = {
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

export const getInquiryDetail = (req: Request, res: Response) => {
  // 문의 상세 조회
};

export const updateInquiry = (req: Request, res: Response) => {
  // 문의 수정
};

export const deleteInquiry = (req: Request, res: Response) => {
  // 문의 삭제
};

export const getInquiryReplyDetail = (req: Request, res: Response) => {
  // 문의 답변 상세 조회
};

export const updateInquiryReply = (req: Request, res: Response) => {
  // 문의 답변 수정
};

export const createInquiryReply = (req: Request, res: Response) => {
  // 문의 답변
};
