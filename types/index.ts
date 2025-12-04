export type DBUserResult = {
  id: number;
  email: string;
  name: string;
  type: 'BUYER' | 'SELLER';
  image: string | null;
  createdAt: Date;
  updatedAt: Date;

  userPoints: {
    points: number;
    grade: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  } | null;
};

export interface UserResponseDto {
  id: number;
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
