"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DIRECTION_TYPE } from "@/containers/trade/components/LeftPanel/trade-panel.types";

interface DirectionStore {
  direction: DIRECTION_TYPE;
  setDirection: (direction: DIRECTION_TYPE) => void;
}

export const useDirectionStore = create<DirectionStore>()(
  persist(
    (set) => ({
      direction: DIRECTION_TYPE.long,
      setDirection: (direction) => set({ direction }),
    }),
    {
      name: "direction-storage",
    },
  ),
);
