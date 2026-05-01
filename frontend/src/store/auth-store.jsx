import { create } from "zustand";

export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  setAuth: (user) =>
    set({
      isAuthenticated: true,
      user,
      isLoading: false,
    }),

  logout: () =>
    set({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    }),

  finishLoading: () =>
    set({
      isLoading: false,
    }),
}));
