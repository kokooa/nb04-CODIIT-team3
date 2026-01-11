import { postRefresh } from "@/lib/api/auth";
import { useApiStore } from "@/stores/useApiStore";
import { useUserStore } from "@/stores/userStore";
import axios from "axios";

export const getAxiosInstance = () => {
  const baseURL = useApiStore.getState().baseURL;

  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  // 요청 인터셉터: accessToken 자동 첨부
  instance.interceptors.request.use(
    (config) => {
      const token = useUserStore.getState().accessToken;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // 응답 인터셉터: 401 → 리프레시 토큰 갱신 → 재요청
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const { response, config } = error;
      const status = response?.status;
      const isLoginRequest = config.url?.includes("/login") && config.method === "post";
      const isLocalhost =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

      // 조건: 401 + 로그인 요청이 아님 + 리트라이 안 함
      if (status === 401 && !config._retry && !isLoginRequest) {
        if (isLocalhost) {
          alert("Access token이 만료되었습니다. 다시 로그인해주세요.");
          useUserStore.getState().logout();
          window.location.href = "/login";
          return Promise.reject(error);
        }

        config._retry = true;

        try {
          const { accessToken } = await postRefresh();

          useUserStore.getState().setAccessToken(accessToken);
          config.headers.Authorization = `Bearer ${accessToken}`;

          return instance(config); // 재요청
        } catch {
          console.warn("Refresh 실패. 로그아웃 처리합니다.");
          useUserStore.getState().logout();
          window.location.href = "/login";
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};
