import { ChannelID } from "@/containers/trade/components/Chart/components/PriceChart/TradingViewChart/services";
import { TradingViewBar } from "@/containers/trade/components/Chart/components/PriceChart/TradingViewChart/types";
import {
  Bar,
  ResolutionString,
  SubscribeBarsCallback,
} from "@/shared/types/charting-library";
import { DEFAULT_RESOLUTION } from "@/shared/utils/maps";
import { persistValue } from "@/shared/utils/persistValue";

export type HandlerType = {
  callback: SubscribeBarsCallback;
  id: string;
  onConnectionReset: () => void;
};
export const lastBarsCache = new Map<ChannelID, TradingViewBar>();
export const candlesSubscriptionsByChannelId: Map<
  ChannelID,
  {
    handlers: Record<string, HandlerType>;
    lastBar: Bar;
    resolution: ResolutionString;
    subscribeUID: string;
  }
> = new Map();

export const [savedTvChartResolution, setTvChartResolution] =
  persistValue<ResolutionString>({
    defaultValue: DEFAULT_RESOLUTION as ResolutionString,
    name: "tvChartResolution",
  });
