import { create } from "zustand";

export const useSaleFilterStore = create((set) => ({
  date: undefined,
  paymentMethodId: undefined,
  setFilters: (filters) => set(filters),
}));
