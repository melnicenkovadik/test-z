import { Candle as CandleSDK } from "@reyaxyz/api-sdk";

interface CandleDataByMarket {
  data: Record<string, Candle[]>;
}
export type SliceState = {
  candles: Record<string, CandleDataByMarket>;
  resolution: string;
};

export type Candle = CandleSDK;

export type TradingViewBar = {
  close: number;
  high: number;
  low: number;
  open: number;
  time: number;
  volume: number;
};

export type TradingViewSymbol = {
  description: string;
  exchange: string;
  full_name: string;
  symbol: string;
  type: string;
};

export type StorkPricePayload = {
  assetPairId: string;
  price: string;
  timestamp: number;
};
