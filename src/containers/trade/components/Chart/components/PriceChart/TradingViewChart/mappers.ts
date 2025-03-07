import { Bar } from "@/shared/types/charting-library";

import { Candle, TradingViewBar } from "./types";

export const mapCandle = ({
  startedAt,
  open,
  close,
  high,
  low,
  baseTokenVolume,
}: Candle): TradingViewBar => ({
  close: parseFloat(close),
  high: parseFloat(high),
  low: parseFloat(low),
  open: parseFloat(open),
  time: new Date(startedAt).getTime(),
  volume: Math.ceil(Number(baseTokenVolume)),
});

export const updateBar = (currentBar: Bar, close: number) => {
  const high = close > currentBar.high ? close : currentBar.high;
  const low = close < currentBar.low ? close : currentBar.low;

  return { ...currentBar, close, high, low };
};
