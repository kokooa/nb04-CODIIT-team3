import type { Request, Response } from "express";
import { InquiryService } from "../services/inquiry-service.js";

export class InquiryController {
  private inquiryService = new InquiryService();

  createInquiry = async (req: Request, res: Response) => {
    try {
      const productId = Number(req.params.productId);
      const inquiry = await this.inquiryService.createInquiry(productId, req.body);
      res.status(201).json(inquiry);
    } catch (error) {
      res.status(500).json({ error: "문의 등록 실패" });
    }
  };

  getInquiries = async (req: Request, res: Response) => {
    try {
      const productId = Number(req.params.productId);
      const list = await this.inquiryService.getInquiries(productId);
      res.json(list);
    } catch (error) {
      res.status(500).json({ error: "문의 조회 실패" });
    }
  };
}