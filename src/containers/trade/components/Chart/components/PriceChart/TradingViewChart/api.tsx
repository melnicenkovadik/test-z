// @ts-nocheck
import { DateTime } from "luxon";

import { lastBarsCache } from "@/containers/trade/components/Chart/components/PriceChart/TradingViewChart/cache";
import { mapCandle } from "@/containers/trade/components/Chart/components/PriceChart/TradingViewChart/mappers";
import {
  subscribeOnStream,
  unsubscribeFromStream,
} from "@/containers/trade/components/Chart/components/PriceChart/TradingViewChart/streaming";
import {
  Candle,
  TradingViewBar,
  TradingViewSymbol,
} from "@/containers/trade/components/Chart/components/PriceChart/TradingViewChart/types";
import { usePerpetualsStore } from "@/containers/trade/components/Chart/components/PriceChart/TradingViewChart/usePerpetualsStore";
import { useReyaChartsClient } from "@/containers/trade/components/Chart/useReyaChartsClient";
import { MarketEntity } from "@/services/markets/types";
import { useMarketStore } from "@/shared/store/useMarketStore";
import {
  Bar,
  DatafeedConfiguration,
  HistoryCallback,
  LibrarySymbolInfo,
  OnReadyCallback,
  ResolutionString,
  ResolveCallback,
  SearchSymbolsCallback,
  SubscribeBarsCallback,
  Timezone,
} from "@/shared/types/charting-library";
import { RESOLUTION_MAP } from "@/shared/utils/maps";
import { extractError } from "@/shared/utils/ui-minions/extract-error";

import { generateChannelId } from "./services";

const timezone = DateTime.local().get("zoneName") as unknown as Timezone;

const configurationData: DatafeedConfiguration = {
  exchanges: [
    {
      desc: "Reya Exchange",
      name: "Reya",
      value: "Reya",
    },
  ],
  supported_resolutions: Object.keys(RESOLUTION_MAP) as ResolutionString[],
  symbols_types: [
    {
      name: "crypto",
      value: "crypto",
    },
  ],
};

const getAllSymbols = (markets: MarketEntity[]): TradingViewSymbol[] =>
  markets.map((market) => ({
    description: market.ticker,
    exchange: "Reya",
    full_name: market.ticker,
    symbol: market.ticker,
    type: "crypto",
  }));

const getHistorySlice = ({
  bars,
  fromMs,
  toMs,
  firstDataRequest,
}: {
  bars?: TradingViewBar[];
  firstDataRequest: boolean;
  fromMs: number;
  toMs: number;
}): TradingViewBar[] => {
  if (!bars || (!firstDataRequest && bars.length > 0 && toMs < bars[0].time)) {
    return [];
  }

  return bars.filter(({ time }) => time >= fromMs);
};

export const getReyaDatafeed = (
  getCandlesForDatafeed: ReturnType<
    typeof useReyaChartsClient
  >["getCandlesForDatafeed"],
) => ({
  getBars: async (
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: {
      countBack: number;
      firstDataRequest: boolean;
      from: number;
      to: number;
    },
    onHistoryCallback: HistoryCallback,
    onErrorCallback: ErrorCallback,
  ) => {
    if (!symbolInfo) return;

    const { countBack, from, to, firstDataRequest } = periodParams;
    const fromMs = from * 1000;
    let toMs = to * 1000;

    if (firstDataRequest && resolution === "1D") {
      toMs += 1;
    }

    try {
      const { candles, resolution, setCandlesAction } =
        usePerpetualsStore.getState();

      const currentBars =
        candles?.[symbolInfo.full_name]?.data[resolution] || [];
      const cachedBars = getHistorySlice({
        bars: currentBars,
        firstDataRequest,
        fromMs,
        toMs,
      });

      let fetchedCandles: Candle[] | undefined;

      if (cachedBars.length < countBack) {
        const marketId = useMarketStore.getState().selectedMarket.id;
        const earliestCachedBarTime = cachedBars?.[cachedBars.length - 1]?.time;

        fetchedCandles = !marketId
          ? []
          : await getCandlesForDatafeed({
              fromMs,
              marketId,
              resolution,
              toMs: earliestCachedBarTime || toMs,
            });
        setCandlesAction({
          candles: fetchedCandles,
          resolution,
          symbol: symbolInfo.full_name,
        });
      }

      const bars = [
        ...cachedBars,
        ...(fetchedCandles?.map(mapCandle) || []),
      ].reverse();
      if (bars.length === 0) {
        onHistoryCallback([], {
          noData: true,
        });

        return;
      }

      if (firstDataRequest) {
        lastBarsCache.set(
          generateChannelId({
            resolution: RESOLUTION_MAP[resolution],
            ticker: symbolInfo.full_name,
          }),
          {
            ...bars[bars.length - 1],
          },
        );
      }

      onHistoryCallback(bars, {
        noData: false,
      });
    } catch (error) {
      onErrorCallback(extractError(error));
    }
  },

  onReady: (callback: OnReadyCallback) => {
    setTimeout(() => callback(configurationData));
  },

  resolveSymbol: (
    symbolName: string,
    onSymbolResolvedCallback: ResolveCallback,
    onResolveErrorCallback: ErrorCallback,
  ) => {
    const markets = useMarketStore.getState().markets;
    const symbols = getAllSymbols(markets);
    const symbolItem = symbols.find(
      ({ symbol }: { symbol: string }) => symbol === symbolName,
    );

    if (!symbolItem) {
      onResolveErrorCallback("cannot resolve symbol");
      return;
    }
    const tickSizeDecimals =
      useMarketStore.getState()?.selectedMarket?.tickSizeDecimals;

    const pricescale = tickSizeDecimals ? 10 ** tickSizeDecimals : 100;

    const symbolInfo: LibrarySymbolInfo = {
      data_status: "streaming",
      description: symbolItem.description,
      exchange: "Reya",
      format: "price",
      full_name: symbolItem.full_name,
      has_daily: true,
      has_intraday: true,
      intraday_multipliers: ["1", "5", "15", "30", "60", "240"],
      listed_exchange: "Reya",
      minmov: 1,
      name: symbolItem.symbol,
      pricescale,
      session: "24x7",
      supported_resolutions:
        configurationData.supported_resolutions as ResolutionString[],
      ticker: symbolItem.full_name,
      timezone,
      type: symbolItem.type,
    };

    setTimeout(() => onSymbolResolvedCallback(symbolInfo), 0);
  },

  searchSymbols: (
    userInput: string,
    exchange: string,
    symbolType: string,
    onResultReadyCallback: SearchSymbolsCallback,
  ) => {
    onResultReadyCallback([]);
  },

  subscribeBars: (
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onRealtimeCallback: SubscribeBarsCallback,
    subscribeUID: string,
    onResetCacheNeededCallback: () => void,
  ) => {
    const handleOnRealtimeCallback = (bar: Bar) => {
      onRealtimeCallback(bar);
    };
    subscribeOnStream({
      lastBar: lastBarsCache.get(
        generateChannelId({
          resolution: RESOLUTION_MAP[resolution],
          ticker: symbolInfo.full_name,
        }),
      ),
      onRealtimeCallback: handleOnRealtimeCallback,
      onResetCacheNeededCallback,
      resolution,
      subscribeUID,
      symbolInfo,
    });
  },

  unsubscribeBars: (subscriberUID: string) => {
    unsubscribeFromStream({ subscriberUID });
  },
});

export { savedTvChartResolution, setTvChartResolution } from "./cache";
