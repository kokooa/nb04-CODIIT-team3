// src/controllers/metadata.controller.ts
import type { Request, Response } from 'express';
import { GRADE_POLICIES } from '../types/index.js';

export const getGradeMetadata = async (req: Request, res: Response) => {
  try {
    return res.status(200).json(GRADE_POLICIES);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: '등급 정보를 불러오지 못했습니다.' });
  }
};
