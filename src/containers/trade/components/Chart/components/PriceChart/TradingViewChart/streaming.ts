import { generateChannelId } from "@/containers/trade/components/Chart/components/PriceChart/TradingViewChart/services";
import { websocketClient } from "@/providers/websocket";
import {
  Bar,
  LibrarySymbolInfo,
  ResolutionString,
  SubscribeBarsCallback,
} from "@/shared/types/charting-library";
import { RESOLUTION_MAP } from "@/shared/utils/maps";

import { candlesSubscriptionsByChannelId } from "./cache";

export const subscribeOnStream = ({
  symbolInfo,
  resolution,
  onRealtimeCallback,
  subscribeUID,
  onResetCacheNeededCallback,
  lastBar,
}: {
  lastBar: Bar | undefined;
  onRealtimeCallback: SubscribeBarsCallback;
  onResetCacheNeededCallback: () => void;
  resolution: ResolutionString;
  subscribeUID: string;
  symbolInfo: LibrarySymbolInfo;
}) => {
  if (!symbolInfo.name) return;
  if (!lastBar) return;

  const channelId = generateChannelId({
    resolution: RESOLUTION_MAP[resolution],
    ticker: symbolInfo.name,
  });

  const handler = {
    callback: onRealtimeCallback,
    id: subscribeUID,
    onConnectionReset: onResetCacheNeededCallback,
  };

  let subscriptionItem = candlesSubscriptionsByChannelId.get(channelId);

  if (subscriptionItem) {
    subscriptionItem.handlers[subscribeUID] = handler;
    return;
  }

  subscriptionItem = {
    handlers: {
      [subscribeUID]: handler,
    },
    lastBar,
    resolution,
    subscribeUID,
  };
  candlesSubscriptionsByChannelId.set(channelId, subscriptionItem);
  websocketClient.handleCandlesSubscription({ channelId, subscribe: true });
};

interface UnsubscribeFromStreamParams {
  subscriberUID: string;
}

export const unsubscribeFromStream = ({
  subscriberUID,
}: UnsubscribeFromStreamParams) => {
  for (const channelId of Array.from(candlesSubscriptionsByChannelId.keys())) {
    const subscriptionItem = candlesSubscriptionsByChannelId.get(channelId);
    const { handlers } = subscriptionItem || {};

    if (subscriptionItem && handlers?.[subscriberUID]) {
      delete subscriptionItem.handlers[subscriberUID];

      if (Object.keys(subscriptionItem.handlers).length === 0) {
        websocketClient.handleCandlesSubscription({
          channelId,
          subscribe: false,
        });
        candlesSubscriptionsByChannelId.delete(channelId);
        break;
      }
    }
  }
};
