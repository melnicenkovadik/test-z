"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { MarketUI } from "@/services/markets/types";

interface MarketState {
  markets: MarketUI[];
  selectedMarket: MarketUI | null;
  isLoading: boolean;
  error: string | null;

  setMarkets: (markets: MarketUI[]) => void;
  setSelectedMarket: (market: MarketUI | null) => void;
  setIsLoading: (value: boolean) => void;
  setError: (value: string | null) => void;
}

const useMarketStore = create<MarketState>()(
  persist(
    (set, get) => ({
      markets: [],
      selectedMarket: null,
      isLoading: false,
      error: null,

      setMarkets: (markets) => {
        const { selectedMarket } = get();
        if (!selectedMarket) {
          const activeMarket =
            markets.find((m) => m.isActive) ?? markets[0] ?? null;

          set({ selectedMarket: activeMarket, markets });
        } else {
          const newSelectedMarket = markets.find(
            (m) => m.id === selectedMarket.id,
          );
          if (!newSelectedMarket) {
            set({ markets, selectedMarket: markets[0] ?? null });
          } else {
            set({ markets, selectedMarket: newSelectedMarket });
          }
        }
      },

      setSelectedMarket: (market) => set({ selectedMarket: market }),
      setIsLoading: (value) => set({ isLoading: value }),
      setError: (value) => set({ error: value }),
    }),
    {
      name: "market-store",
    },
  ),
);

export { useMarketStore };
