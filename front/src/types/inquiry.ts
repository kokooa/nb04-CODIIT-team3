import { User } from "./User";

export interface InquiryProduct {
  id: string;
  name: string;
  image: string;
  store: {
    id: string;
    name: string;
  };
}

export interface Inquiry {
  id: string;
  title: string;
  content: string;
  isSecret: boolean;
  status: "CompletedAnswer" | "WaitingAnswer";
  user: Pick<User, "id" | "name">;
  product: InquiryProduct;
  createdAt: Date;
}

export interface InquiryList {
  list: Inquiry[];
  totalCount: number;
}

export interface InquiryResponse {
  data: InquiryList;
}

export interface InquiryReplyUser {
  id: string;
  name: string;
}

export interface InquiryReply {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: InquiryReplyUser;
}

export interface InquiryDetailAnswer {
  id: string;
  userId: string;
  productId: string;
  title: string;
  content: string;
  status: "CompletedAnswer" | "WaitingAnswer";
  isSecret: boolean;
  createdAt: string;
  updatedAt: string;
  reply?: InquiryReply;
}

// 문의
export interface InquiryData {
  id: string;
  title: string;
  content: string;
  status: "CompletedAnswer" | "WaitingAnswer";
  isSecret: boolean;
  userId?: string;
  productId?: string;
  createdAt: string;
  updatedAt: string;
  user?: { name: string };
  reply?: InquiryReply | null;
}

// 문의 조회 response
export interface ProductInquiryResponse {
  list: InquiryData[];
  totalCount: number;
}
