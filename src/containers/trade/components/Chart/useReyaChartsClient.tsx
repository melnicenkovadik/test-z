"use client";

import { ApiClient, Candle } from "@reyaxyz/api-sdk";
import { createContext, useCallback, useContext } from "react";

import { MarketEntity } from "@/services/markets/types";
import { RESOLUTION_MAP } from "@/shared/utils/maps";

import { ResolutionString } from "../../../../../public/static/charting_library";

type ReyaChartsContextType = ReturnType<typeof useReyaChartsClientContext>;
const ReyaChartsContext = createContext<ReyaChartsContextType>(
  {} as ReyaChartsContextType,
);
ReyaChartsContext.displayName = "reyaChartsClient";

export const useReyaChartsClient = () => useContext(ReyaChartsContext);

const useReyaChartsClientContext = () => {
  const requestCandles = useCallback(
    async ({
      marketId,
      resolution,
      fromISO,
      toISO,
    }: {
      fromISO?: string;
      marketId: MarketEntity["id"];
      resolution: ResolutionString;
      toISO?: string;
    }): Promise<Candle[]> => {
      try {
        const { candles } = await ApiClient.markets.getMarketCandles({
          fromISO,
          marketId,
          resolution: RESOLUTION_MAP[resolution],
          toISO,
        });
        return candles || [];
      } catch (error) {
        console.error("Error fetching candles", error);
        return [];
      }
    },
    [],
  );

  const getCandlesForDatafeed = useCallback(
    async ({
      marketId,
      resolution,
      fromMs,
      toMs,
    }: {
      fromMs: number;
      marketId: MarketEntity["id"];
      resolution: ResolutionString;
      toMs: number;
    }) => {
      const fromIso = new Date(fromMs).toISOString();
      let toIso = new Date(toMs).toISOString();
      const candlesInRange: Candle[] = [];

      while (true) {
        const candles = await requestCandles({
          fromISO: fromIso,
          marketId,
          resolution,
          toISO: toIso,
        });

        if (!candles || candles.length === 0) {
          break;
        }

        candlesInRange.push(...candles);
        const length = candlesInRange.length;

        if (length) {
          const oldestTime = new Date(
            candlesInRange[length - 1].startedAt,
          ).getTime();

          if (oldestTime > fromMs) {
            toIso = candlesInRange[length - 1].startedAt;
          } else {
            break;
          }
        } else {
          break;
        }
      }

      return candlesInRange;
    },
    [requestCandles],
  );

  return {
    getCandlesForDatafeed,
  };
};

export const ReyaChartsProvider = ({ ...props }) => (
  <ReyaChartsContext.Provider value={useReyaChartsClientContext()} {...props} />
);
