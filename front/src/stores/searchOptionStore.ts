import { create } from "zustand";

interface SearchOption {
  priceMin: number;
  priceMax: number;
  favoriteStore: string;
  size: string;
  categoryName: string;
}

interface SearchOptionStore {
  searchOption: SearchOption;
  updateOption: (field: keyof SearchOption, value: number | string) => void;
  resetOption: () => void;
}

const initialSearchOption: SearchOption = {
  priceMin: 0,
  priceMax: 0,
  favoriteStore: "",
  size: "",
  categoryName: "",
};

export const useSearchOptionStore = create<SearchOptionStore>((set) => ({
  searchOption: initialSearchOption,
  updateOption: (field, value) =>
    set((state) => ({
      searchOption: {
        ...state.searchOption,
        [field]: state.searchOption[field] === value ? (typeof value === "number" ? 0 : "") : value,
      },
    })),
  resetOption: () =>
    set({
      searchOption: initialSearchOption,
    }),
}));
