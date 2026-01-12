import { LoginRequest, LoginResponse, RefreshResponse, SignupRequest, SignupResponse } from "@/types/auth";
import axios from "axios";
import { getAxiosInstance } from "./axiosInstance";

// 회원가입
export const postSignup = async (data: SignupRequest): Promise<SignupResponse> => {
  const axiosInstance = getAxiosInstance();
  const response = await axiosInstance.post<SignupResponse>("/users", data);
  return response.data;
};

// 로그인
export const postLogin = async (data: LoginRequest): Promise<LoginResponse> => {
  const axiosInstance = getAxiosInstance();
  const response = await axiosInstance.post<LoginResponse>("/auth/login", data);
  return response.data;
};

// Access Token 재발급
export const postRefresh = async (): Promise<RefreshResponse> => {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
    {},
    {
      withCredentials: true,
    }
  );
  return response.data;
};

// 로그아웃
export const postLogout = async (): Promise<{ message: string }> => {
  const axiosInstance = getAxiosInstance();
  const res = await axiosInstance.post("/auth/logout");
  return res.data;
};
