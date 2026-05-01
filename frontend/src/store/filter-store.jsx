import { create } from "zustand";

export const useFilterStore = create((set) => ({
  search: undefined,
  isGranel: undefined,
  isUnit: undefined,
  isLowStock: undefined,
  setFilters: (filters) => set(filters),
}));
