import { produce } from "immer";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface HistoryState {
  isHistoryOpen: boolean;
  toggleHistoryOpen: () => void;
}

export const useHistoryStoreOpen = create<HistoryState>()(
  persist(
    (set) => ({
      isHistoryOpen: true,
      toggleHistoryOpen: () => {
        set(
          produce((state) => {
            state.isHistoryOpen = !state.isHistoryOpen;
          }),
        );
      },
    }),
    {
      name: "history-store",
      skipHydration: false,
    },
  ),
);
