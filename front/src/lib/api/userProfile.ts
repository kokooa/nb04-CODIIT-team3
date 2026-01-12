import { getAxiosInstance } from "@/lib/api/axiosInstance";
import { FavoriteStores } from "@/types/store";
import { AxiosError } from "axios";

interface EditProfileParams {
  currentPassword: string;
  nickname?: string;
  newPassword?: string;
  imageFile?: File | null; // 이미지 파일 추가
}

export const editUserProfile = async ({ currentPassword, nickname, newPassword, imageFile }: EditProfileParams) => {
  const axiosInstance = getAxiosInstance();
  const formData = new FormData();

  formData.append("currentPassword", currentPassword);

  if (nickname && nickname.trim() !== "") {
    formData.append("name", nickname.trim());
  }

  if (newPassword && newPassword.trim() !== "") {
    formData.append("password", newPassword.trim());
  }

  if (imageFile) {
    formData.append("image", imageFile);
  }

  try {
    const { data } = await axiosInstance.patch("/users/me", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data;
  } catch (err) {
    const error = err as AxiosError;
    console.error("프로필 수정 실패", error.response?.data || error.message);
    throw err;
  }
};

export const getFavoriteStore = async (): Promise<FavoriteStores[]> => {
  const axiosInstance = getAxiosInstance();
  const response = await axiosInstance.get(`/users/me/likes`);
  return response.data;
};
