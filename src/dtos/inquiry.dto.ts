/* ------------------------------------------------------- */
// DTOs for Inquiry

export interface InquiryListResponseDto {
  list: InquiryItemDto[];
  totalCount: number;
}

export interface InquiryItemDto {
  id: string;
  title: string;
  isSecret: boolean;
  status: InquiryStatus;
  product: InquiryProductDto;
  user: InquiryUserDto;
  createdAt: Date;
  content: string;
}

interface InquiryProductDto {
  id: string;
  name: string;
  image: string;
  store: InquiryStoreDto;
}

interface InquiryStoreDto {
  id: string;
  name: string;
}

interface InquiryUserDto {
  name: string;
}

// Enum 대신 객체 리터럴과 타입을 사용하여 InquiryStatus 정의
export const InquiryStatus = {
  WaitingAnswer: 'WaitingAnswer',
  CompletedAnswer: 'CompletedAnswer',
} as const;

export type InquiryStatus = (typeof InquiryStatus)[keyof typeof InquiryStatus];

// getInquiries 함수의 매개변수 DTO
export interface FetchInquiriesParamsDto {
  page: number;
  pageSize: number;
  status?: InquiryStatus;
  userId: string;
  userRole?: 'BUYER' | 'SELLER';
}

/* ------------------------------------------------------- */

export interface InquiryDetailResponseDto {
  id: string;
  userId: string;
  productId: string;
  title: string;
  content: string;
  status: InquiryStatus;
  isSecret: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: InquiryUserDto;
  reply?: InquiryReplyDto;
}

interface InquiryReplyDto {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: InquiryUserDto;
}

export interface FetchInquiryDetailParamsDto {
  inquiryId: string;
}

/* ------------------------------------------------------- */

export interface UpdateInquiryParamsDto {
  inquiryId: string;
  title: string;
  content: string;
  isSecret: boolean;
}

export interface UpdateInquiryResponseDto {
  id: string;
  userId: string;
  productId: string;
  title: string;
  content: string;
  status: InquiryStatus;
  isSecret: boolean;
  createdAt: Date;
  updatedAt: Date;
}
