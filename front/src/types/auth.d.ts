export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  image?: string;
  type: "BUYER" | "SELLER";
}

export interface User {
  id: string;
  email: string;
  name: string;
  type: "BUYER" | "SELLER";
  points: number;
  image: string;
  grade: {
    id: string;
    name: string;
    rate: number;
    minAmount: number;
  } | null;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
}

export type SignupResponse = User;
