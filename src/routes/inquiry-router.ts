import express from 'express';
import { InquiryController } from '../controllers/inquiry-controller.js';
import { authMiddleware } from '../common/middlewares.js';

const router = express.Router();
const inquiryController = new InquiryController();

// 내 문의 조회 (판매자, 구매자 공용)
router.get('/', authMiddleware, inquiryController.getInquiries);

// 문의 상세 조회
router.get('/:inquiryId', authMiddleware, inquiryController.getInquiryDetail);

// 문의 수정
router.patch('/:inquiryId', authMiddleware, inquiryController.updateInquiry);

// 문의 삭제
router.delete('/:inquiryId', authMiddleware, inquiryController.deleteInquiry);

// 문의 답변 상세 조회 (사라짐)
/* router.get(
  '/inquiries/:replyId/replies',
  inquiryController.getInquiryReplyDetail,
); */

// 문의 답변
router.post(
  '/:inquiryId/replies',
  authMiddleware,
  inquiryController.createInquiryReply,
);

// 문의 답변 수정
router.patch(
  '/:replyId/replies',
  authMiddleware,
  inquiryController.updateInquiryReply,
);

export default router;
