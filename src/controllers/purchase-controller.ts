import type { Request, Response } from 'express';
import { PurchaseService } from '../services/purchase-service.js';

export const PurchaseController = {
  /**
   * 주문 생성 (POST /orders)
   */
  async createOrder(req: Request, res: Response) {
    try {
      // 1. 로그인한 유저 ID 가져오기 (Auth Middleware가 req.user에 정보를 넣어준다고 가정)
      // 타입 정의에 따라 req.user?.id 혹은 req.userId 등을 사용하세요.
      const userId = (req as any).user?.id;

      if (!userId) {
        return res
          .status(401)
          .json({ message: '로그인이 필요한 서비스입니다.' });
      }

      // 2. Request Body 추출
      const { name, phone, address, orderItems, usePoint } = req.body;

      // 3. 유효성 검사 (간단한 예시)
      if (
        !orderItems ||
        !Array.isArray(orderItems) ||
        orderItems.length === 0
      ) {
        return res.status(400).json({ message: '주문할 상품이 없습니다.' });
      }

      // 4. 서비스 호출
      // Service에서 DB 트랜잭션, 재고 체크, Response Formatting을 모두 처리합니다.
      const newOrder = await PurchaseService.createOrder(userId, {
        name,
        phone,
        address,
        orderItems, // [{ productId: "...", size: "M", quantity: 2 }, ...] 구조여야 함
        usePoint: usePoint || 0,
      });

      // 5. 결과 반환 (201 Created)
      return res.status(201).json(newOrder);
    } catch (error: any) {
      console.error('Create Order Error:', error);

      // 에러 메시지에 따른 분기 처리 (선택 사항)
      if (error.message.includes('재고 부족')) {
        return res.status(409).json({ message: error.message }); // 409 Conflict
      }

      return res.status(500).json({
        message: '주문 처리 중 오류가 발생했습니다.',
        error: error.message,
      });
    }
  },
  async getPurchases(req: Request, res: Response) {
    try {
      // 1. 유저 ID 추출
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
      }

      // 2. 쿼리 파라미터 처리
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      // 3. 서비스 호출
      const result = await PurchaseService.getPurchases(userId, page, limit);

      // 4. 응답
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: '구매 내역 조회 실패',
        error: (error as Error).message,
      });
    }
  },

  // 주문 상세 조회
  async getPurchaseById(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      // URL 파라미터에서 purchaseId(또는 orderId) 추출
      const { purchaseId } = req.params;

      if (!userId) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
      }

      if (!purchaseId) {
        return res.status(400).json({ message: '주문 ID가 필요합니다.' });
      }

      const result = await PurchaseService.getPurchaseById(userId, purchaseId);

      res.status(200).json(result);
    } catch (error: any) {
      // 에러 메시지에 따른 상태코드 분기
      if (error.message === 'NOT_FOUND') {
        return res
          .status(404)
          .json({ message: '주문 정보를 찾을 수 없습니다.' });
      }
      if (error.message === 'FORBIDDEN') {
        return res.status(403).json({ message: '권한이 없습니다.' });
      }

      console.error(error);
      res.status(500).json({
        message: '상세 조회 실패',
        error: error.message,
      });
    }
  },

  // 주문 정보 수정
  async updatePurchase(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { purchaseId } = req.params;

      // 요청 바디에서 수정할 데이터 추출
      const { name, phone, address } = req.body;

      if (!userId) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
      }

      if (!purchaseId) {
        return res.status(400).json({ message: '주문 ID가 필요합니다.' });
      }

      // 최소한 하나라도 수정할 값이 있어야 함
      if (!name && !phone && !address) {
        return res.status(400).json({ message: '수정할 정보가 없습니다.' });
      }

      const result = await PurchaseService.updatePurchase(userId, purchaseId, {
        name,
        phone,
        address,
      });

      res.status(200).json(result);
    } catch (error: any) {
      if (error.message === 'NOT_FOUND') {
        return res.status(404).json({ message: '주문을 찾을 수 없습니다.' });
      }
      if (error.message === 'FORBIDDEN') {
        return res.status(403).json({ message: '수정 권한이 없습니다.' });
      }
      if (error.message === 'CANNOT_UPDATE') {
        return res
          .status(409)
          .json({ message: '배송 중이거나 완료된 주문은 수정할 수 없습니다.' });
      }

      console.error(error);
      res.status(500).json({
        message: '주문 수정 실패',
        error: error.message,
      });
    }
  },

  // 5. 주문 취소
  async cancelPurchase(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { purchaseId } = req.params;

      if (!userId) return res.status(401).json({ message: '로그인 필요' });
      if (!purchaseId) return res.status(400).json({ message: 'ID 필요' });

      const result = await PurchaseService.cancelPurchase(userId, purchaseId);

      res.status(200).json(result);
    } catch (error: any) {
      if (error.message === 'NOT_FOUND')
        return res.status(404).json({ message: '주문 없음' });
      if (error.message === 'FORBIDDEN')
        return res.status(403).json({ message: '권한 없음' });

      // 배송 중이라 취소 불가할 때
      if (error.message === 'CANNOT_CANCEL') {
        return res
          .status(409)
          .json({
            message: '이미 배송 중이거나 완료된 주문은 취소할 수 없습니다.',
          });
      }
      if (error.message === 'ALREADY_CANCELED') {
        return res.status(409).json({ message: '이미 취소된 주문입니다.' });
      }

      console.error(error);
      res.status(500).json({ message: '취소 실패', error: error.message });
    }
  },
};
