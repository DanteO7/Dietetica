import { create } from "zustand";

export const useSaleFilterStore = create((set) => ({
  date: undefined,
  dateTo: undefined,
  paymentMethodId: undefined,
  setFilters: (filters) => set(filters),
}));
