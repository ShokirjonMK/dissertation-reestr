import { create } from "zustand";

import type { SearchQueryParams } from "@/types";

type FiltersStore = {
  filters: SearchQueryParams;
  setFilter: <K extends keyof SearchQueryParams>(key: K, value: SearchQueryParams[K]) => void;
  resetFilters: () => void;
};

const defaultFilters: SearchQueryParams = {
  query: "",
  title: "",
  problem: "",
  proposal: "",
  annotation: "",
  conclusion: "",
  keywords: "",
  author: "",
  supervisor: "",
  university_id: "",
  scientific_direction_id: "",
  year: "",
  status: "",
  category: "",
  expert_rating_min: 0,
  region_id: "",
  visibility: "internal",
};

export const useFiltersStore = create<FiltersStore>()((set) => ({
  filters: defaultFilters,
  setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
