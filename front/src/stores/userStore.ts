import { User } from "@/types/auth";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  setUser: (user: User) => void;
  setLoading: (state: boolean) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setLoading: (state) => set({ isLoading: state }),
      setAccessToken: (token) => set({ accessToken: token }),
      logout: () => set({ user: null, accessToken: null }),
    }),
    {
      name: "codiit-user-storage", // 로컬스토리지 key
    }
  )
);
