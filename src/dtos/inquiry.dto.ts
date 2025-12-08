export interface InquiryListResponseDto {
  list: InquiryItemDto[];
  totalCount: number;
}

export interface InquiryItemDto {
  id: string;
  title: string;
  isSecret: string;
  status: InquiryStatus;
  product: InquiryProductDto;
  user: InquiryUserDto;
  createdAt: string;
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
export interface GetInquiriesParamsDto {
  page: number;
  pageSize: number;
  status?: InquiryStatus;
  userId: string;
  userRole?: 'BUYER' | 'SELLER';
}
