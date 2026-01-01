// src/controllers/store-controller.ts
import express from 'express';
type Request = express.Request;
type Response = express.Response;
type NextFunction = express.NextFunction;
import { StoreService } from '../services/store-service.js';
import { UserRole } from '@prisma/client';



const storeService = new StoreService();

export class StoreController {
  /**
   * 스토어 생성 요청을 처리합니다. (판매자만 가능)
   * POST /api/stores
   */
  async createStore(req: Request, res: Response, next: NextFunction) {
    try {
      // authenticate 미들웨어에 의해 req.user가 설정됨
      const sellerId = req.user!.id;

      const { name, address, phoneNumber, description } = req.body;
      const storeImageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

      if (!name || !address || !phoneNumber) {
        return res.status(400).json({ message: '스토어 이름, 주소, 전화번호는 필수 항목입니다.' });
      }

      const newStore = await storeService.createStore(sellerId, {
        name,
        address,
        phoneNumber,
        storeImageUrl: storeImageUrl === undefined ? null : storeImageUrl,
        description: description === undefined ? null : description,
      });

      res.status(201).json({ message: '스토어가 성공적으로 생성되었습니다.', store: newStore });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 판매자의 스토어 정보를 조회합니다. (판매자 본인만 가능)
   * GET /api/stores/my-store
   */
  async getMyStore(req: Request, res: Response, next: NextFunction) {
    try {
      const sellerId = req.user!.id;

      const myStore = await storeService.getMyStore(sellerId);

      if (!myStore) {
        return res.status(404).json({ message: '등록된 스토어가 없습니다.' });
      }

      res.status(200).json({ store: myStore });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 특정 스토어의 상세 정보를 조회합니다. (모든 사용자 가능)
   * GET /api/stores/:storeId
   */
  async getStoreDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId;
      // TODO: 나중에 CUID 유효성 validation 미들웨어 있으면 좋을 것 같네요.
      if (!storeId) {
        return res.status(400).json({ message: '스토어 ID가 필요합니다.' });
      }

      const store = await storeService.getStoreById(storeId);

      if (!store) {
        return res.status(404).json({ message: '스토어를 찾을 수 없습니다.' });
      }

      res.status(200).json({ store });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 스토어 정보를 수정합니다. (스토어 소유주 판매자만 가능)
   * PUT /api/stores/:storeId
   */
  async updateStore(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.storeId;
      // TODO: 나중에 CUID 유효성 validation 미들웨어 있으면 좋을 것 같네요.
      if (!storeId) {
        return res.status(400).json({ message: '스토어 ID가 필요합니다.' });
      }
      const { name, address, phoneNumber, description } = req.body;
      let storeImageUrl: string | undefined;

      if (req.file) {
        storeImageUrl = `/uploads/${req.file.filename}`;
      } else if (req.body.storeImageUrl !== undefined) {
        storeImageUrl = req.body.storeImageUrl;
      }

      if (!name && !address && !phoneNumber && !storeImageUrl && !description) {
        return res.status(400).json({ message: '수정할 스토어 정보가 없습니다.' });
      }

      const updatedStore = await storeService.updateStore(storeId, {
        name,
        address,
        phoneNumber,
        storeImageUrl: storeImageUrl === undefined ? null : storeImageUrl,
        description: description === undefined ? null : description,
      });

      res.status(200).json({ message: '스토어 정보가 성공적으로 수정되었습니다.', store: updatedStore });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 스토어를 관심 스토어로 등록합니다. (인증된 사용자라면 누구든 가능)
   * POST /api/stores/:storeId/favorite
   */
  async addFavoriteStore(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const storeId = req.params.storeId;
      // TODO: 나중에 CUID 유효성 validation 미들웨어 있으면 좋을 것 같네요.
      if (!storeId) {
        return res.status(400).json({ message: '스토어 ID가 필요합니다.' });
      }

      const favoriteStore = await storeService.addFavoriteStore(userId, storeId);

      res.status(201).json({ message: '관심 스토어로 등록되었습니다.', favoriteStore });
    } catch (error: any) {
      if (error.message.includes('이미 관심 스토어로 등록된 스토어입니다.')) {
        return res.status(409).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * 스토어를 관심 스토어에서 해제합니다. (인증된 사용자라면 누구든 가능)
   * DELETE /api/stores/:storeId/favorite
   */
  async removeFavoriteStore(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const storeId = req.params.storeId;
      // TODO: 나중에 CUID 유효성 validation 미들웨어 있으면 좋을 것 같네요.
      if (!storeId) {
        return res.status(400).json({ message: '스토어 ID가 필요합니다.' });
      }

      await storeService.removeFavoriteStore(userId, storeId);

      res.status(200).json({ message: '관심 스토어에서 해제되었습니다.' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 사용자의 관심 스토어 목록을 조회합니다. (인증된 사용자 본인만 가능)
   * GET /api/stores/favorites
   */
  async getFavoriteStores(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const favoriteStores = await storeService.getFavoriteStores(userId);

      res.status(200).json({ favoriteStores });
    } catch (error) {
      next(error);
    }
  }
}
