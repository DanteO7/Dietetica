import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useDataStore = create(
  persist(
    (set) => ({
      commerceName: null,
      setData: (commerceName) => {
        set({ commerceName: commerceName.name });
      },
    }),
    {
      name: "commerce-data",
    },
  ),
);
