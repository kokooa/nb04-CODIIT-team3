export interface UserGrade {
  id: string;
  name: string;
  rate: number;
  minAmount: number;
}

export type UserType = "BUYER" | "SELLER";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  type: UserType;
  points: number;
  createdAt: string;
  updatedAt: string;
  gradeId: string;
  grade: UserGrade;
  image: string;
}
