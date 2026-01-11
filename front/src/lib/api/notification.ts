import { useApiStore } from "@/stores/useApiStore";
import { useUserStore } from "@/stores/userStore";
import { NotificationResponse } from "@/types/notification";
import { EventSourcePolyfill } from "event-source-polyfill";
import { getAxiosInstance } from "./axiosInstance";

// SSE 연결
export const connectNotificationSSE = () => {
  const token = useUserStore.getState().accessToken;
  const baseURL = useApiStore.getState().baseURL;
  return new EventSourcePolyfill(`${baseURL}/notifications/sse`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: false, // Authorization 헤더 충돌 방지
  });
};

// 알림 목록 가져오기
export const getNotifications = async (params?: { page?: number; pageSize?: number }): Promise<NotificationResponse> => {
  const axiosInstance = getAxiosInstance();
  const response = await axiosInstance.get("/notifications", { params });
  return response.data;
};

// 알림 읽음 처리
export const updateNotificationCheck = async (alarmId: string): Promise<void> => {
  const axiosInstance = getAxiosInstance();
  await axiosInstance.patch(`/notifications/${alarmId}/check`);
};
