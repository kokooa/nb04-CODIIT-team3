import { InquiryRepository } from "../repositories/inquiry-repository.js";
import { type CreateInquiryDto } from "../types/inquiry-dto.js";



export class InquiryService {
  private inquiryRepository = new InquiryRepository();

  async createInquiry(productId: number, body: CreateInquiryDto) {
    return this.inquiryRepository.createInquiry({
      productId,
      content: body.content
    });
  }

  async getInquiries(productId: number) {
    return this.inquiryRepository.getInquiries(productId);
  }
}