import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ApiStore {
  baseURL: string;
  setBaseURL: (url: string) => void;
}

export const useApiStore = create<ApiStore>()(
  persist(
    (set) => ({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "",
      setBaseURL: (url) => set({ baseURL: url }),
    }),
    {
      name: "api-storage", // localStorage key
    }
  )
);
