export type DBUserResult = {
  id: string;
  email: string;
  name: string;
  type: 'BUYER' | 'SELLER';
  image: string | null;
  createdAt: Date;
  updatedAt: Date;

  userPoints: {
    points: number;
    grade: 'Green' | 'Orange' | 'Red' | 'Black' | 'VIP';
  } | null;
};

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  password: string;
  type: string;
  points: number;
  createdAt: string;
  updatedAt: string;
  grade: {
    name: string;
    id: string;
    rate: number;
    minAmount: number;
  };
  image: string;
}

// 등급 기준표 타입
export interface GradePolicy {
  grade: string;
  minAmount: number;
  benefit: string;
}

export const GRADE_POLICIES: GradePolicy[] = [
  { grade: 'Green', minAmount: 0, benefit: '기본 적립 1%' },
  { grade: 'Orange', minAmount: 100000, benefit: '추가 적립 2%' },
  { grade: 'Red', minAmount: 300000, benefit: '무료 배송 + 3% 적립' },
  { grade: 'Black', minAmount: 500000, benefit: '무료 배송 + 5% 적립' },
  { grade: 'VIP', minAmount: 1000000, benefit: 'VIP 라운지 + 7% 적립' },
];

// 프론트엔드에 응답할 최종 데이터 타입 (DTO)
export interface UserPointResponse {
  userSummary: {
    currentPoint: number;
    currentGrade: string;
    nextGrade: string | null; // 최고 등급이면 다음 등급이 없음
    remainingPoint: number; // 다음 등급까지 남은 포인트
    progressPercent: number; // 달성률 (0~100%)
  };
}
