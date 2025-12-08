import express from 'express';
import * as inquiryController from '../controllers/inquiry-controller.js';

const router = express.Router();

// 내 문의 조회 (판매자, 구매자 공용)
router.get('/inquiries', inquiryController.getInquiries); // 인증 미들웨어 추가 예정

// 문의 상세 조회
router.get('/inquiries/:inquiryId', inquiryController.getInquiryDetail);

// 문의 수정
router.patch('/inquiries/:inquiryId', inquiryController.updateInquiry); // 인증 미들웨어 추가 예정

// 문읜 삭제
router.delete('/inquiries/:inquiryId', inquiryController.deleteInquiry); // 인증 미들웨어 추가 예정

// 문의 답변 상세 조회
router.get(
  '/inquiries/:replyId/replies',
  inquiryController.getInquiryReplyDetail,
);

// 문의 답변 수정
router.patch(
  'inquiries/:replyId/replies',
  inquiryController.updateInquiryReply,
); // 인증 미들웨어 추가 예정

// 문의 답변
router.post('inquiries/:replyId/replies', inquiryController.createInquiryReply); // 인증 미들웨어 추가 예정

export default router;
