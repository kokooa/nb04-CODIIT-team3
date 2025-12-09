import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class InquiryRepository {
  async createInquiry(data: any) {
    return prisma.inquiry.create({ data });
  }

  async getInquiries(productId: number) {
    return prisma.inquiry.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" }
    });
  }
}