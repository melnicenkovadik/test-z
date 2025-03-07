import { create } from "zustand";

import { RESOLUTION_MAP } from "@/shared/utils/maps";

import { Candle } from "./types";

interface CandleData {
  data: Record<string, Candle[]>;
}

interface PerpetualsStore {
  candles: Record<string, CandleData>;
  resolution: string;
  lastPrice?: number | null;
  setLastPrice: (price: number) => void;
  setCandlesAction: (payload: {
    candles: Candle[];
    resolution: string;
    symbol: string;
  }) => void;
  setTvChartResolutionAction: (payload: { resolution: string }) => void;
}

const initialState: Pick<
  PerpetualsStore,
  "candles" | "resolution" | "lastPrice"
> = {
  candles: {},
  resolution: "60",
  lastPrice: null,
};

export const usePerpetualsStore = create<PerpetualsStore>((set) => ({
  ...initialState,

  setLastPrice: (price) => {
    set((state) => ({
      ...state,
      lastPrice: price,
    }));
  },
  setCandlesAction: ({ candles, resolution, symbol }) => {
    set((state) => {
      const candleState = state.candles[symbol]
        ? { ...state.candles[symbol] }
        : {
            data: Object.fromEntries(
              Object.keys(RESOLUTION_MAP).map((resKey) => [
                resKey,
                [] as Candle[],
              ]),
            ),
          };

      const existingCandles = candleState.data[resolution] ?? [];

      const updatedCandles = [
        ...existingCandles,
        ...(existingCandles.length
          ? candles.filter(
              ({ startedAt }) =>
                startedAt <
                existingCandles[existingCandles.length - 1].startedAt,
            )
          : candles),
      ];

      candleState.data[resolution] = updatedCandles;
      const lastCandle = updatedCandles.reduce((latest, current) =>
        new Date(current.startedAt) > new Date(latest.startedAt)
          ? current
          : latest,
      );

      const lastPrice = lastCandle ? parseFloat(lastCandle.close) : null;

      return {
        ...state,
        lastPrice,
        candles: {
          ...state.candles,
          [symbol]: candleState,
        },
      };
    });
  },

  setTvChartResolutionAction: ({ resolution }) => {
    set((state) => ({
      ...state,
      resolution,
    }));
  },
}));
