import {
  CandleMessage,
  MarketsUpdateMessage,
  SocketChannels,
  SocketClient,
} from "@reyaxyz/api-sdk";

import {
  candlesSubscriptionsByChannelId,
  HandlerType,
} from "@/containers/trade/components/Chart/components/PriceChart/TradingViewChart/cache";
import {
  mapCandle,
  updateBar,
} from "@/containers/trade/components/Chart/components/PriceChart/TradingViewChart/mappers";
import {
  ChannelID,
  parseChannelId,
} from "@/containers/trade/components/Chart/components/PriceChart/TradingViewChart/services";
import { MarketEntity } from "@/services/markets/types";

export type MarketUpdateHandlerPayloadType = (payload: MarketEntity[]) => void;

export class WebsocketClient {
  private socket: SocketClient | null = null;

  private currentCandleId: ChannelID | undefined;
  private reconnectInterval: number = 30_000;
  private reconnectTimer?: NodeJS.Timeout;
  private marketsUpdateHandlers: MarketUpdateHandlerPayloadType[] = [];

  connect(): void {
    this._initializeSocket();
  }

  disconnect(): void {
    this._clearSocket();
  }

  send(message: string): void {
    try {
      this.socket?.send(message);
    } catch {}
  }

  handleCandlesSubscription = ({
    channelId,
    subscribe,
  }: {
    channelId: string;
    subscribe: boolean;
  }) => {
    if (!this.socket) return;

    const { ticker, resolution } = parseChannelId(channelId);
    if (subscribe) {
      this.socket.subscribeToCandles(ticker, resolution);
      this.currentCandleId = channelId;
    } else {
      this.socket.unsubscribeFromCandles(ticker, resolution);

      if (this.currentCandleId === channelId) {
        this.currentCandleId = undefined;
      }
    }
  };

  addMarketsUpdateHandler = (handler: MarketUpdateHandlerPayloadType) => {
    this.marketsUpdateHandlers.push(handler);
  };

  handleAllMarketsSubscription = ({ subscribe }: { subscribe: boolean }) => {
    if (!this.socket) return;

    if (subscribe) {
      this.socket.subscribeToMarketsUpdates();
    } else {
      this.socket.unsubscribeFromMarketsUpdates();
    }
  };

  private handleAllMarketsMessage({ contents: markets }: MarketsUpdateMessage) {
    this.marketsUpdateHandlers.forEach((handler) => handler(markets));

    // update candles
    const subscriptionKeys = Array.from(candlesSubscriptionsByChannelId.keys());
    subscriptionKeys.forEach((key) => {
      const ticker = key.split("/")[0];
      const market = markets.find((item) => item.ticker === ticker);
      if (!market) {
        return;
      }
      const subscriptionItem = candlesSubscriptionsByChannelId.get(key);
      if (subscriptionItem) {
        const lastBar = subscriptionItem.lastBar;

        if (!lastBar || market.markPrice === lastBar.close) {
          return;
        }
        const bar = updateBar(lastBar, market.markPrice);
        subscriptionItem.lastBar = bar;
        Object.values(subscriptionItem.handlers).forEach(
          (handler: HandlerType) => {
            handler.callback(bar);
          },
        );
      }
    });
  }

  private _initializeSocket = (): void => {
    this.socket = new SocketClient({
      environment: "production",
      onClose: () => {
        console.log("Websocket onClose");
        this.socket = null;
      },
      onMessage: (message) => {
        try {
          switch (message.channel) {
            case SocketChannels.CANDLES: {
              this.handleCandleMessage(message as CandleMessage);

              break;
            }
            case SocketChannels.MARKETS_UPDATES: {
              this.handleAllMarketsMessage(message as MarketsUpdateMessage);
            }

            default: {
              break;
            }
          }
        } catch {}
      },
      onOpen: () => {
        if (this.isSocketOpen()) {
          this._setReconnectInterval();
          this.handleAllMarketsSubscription({ subscribe: true });
          if (this.currentCandleId) {
            this.handleCandlesSubscription({
              channelId: this.currentCandleId,
              subscribe: true,
            });
          }
        }
      },
    });
    this.socket?.connect();
  };

  private _setReconnectInterval = () => {
    if (this.reconnectTimer !== null) clearInterval(this.reconnectTimer);

    this.reconnectTimer = setInterval(() => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const readyState = this.socket?.getReadyState();
      if (
        !this.socket ||
        readyState === WebSocket.CLOSED ||
        readyState === WebSocket.CLOSING
      ) {
        if (this.currentCandleId) {
          const subscriptionItem = candlesSubscriptionsByChannelId.get(
            this.currentCandleId,
          );
          if (subscriptionItem) {
            Object.values(subscriptionItem.handlers).forEach(
              (handler: HandlerType) => {
                handler.onConnectionReset();
              },
            );
          }
        }

        this._clearSocket();
        this._initializeSocket();
      }
    }, this.reconnectInterval);
  };

  private handleCandleMessage({ id, contents }: CandleMessage) {
    const candles = contents?.candles || contents || [];
    if (candles.length > 0) {
      const subscriptionItem = candlesSubscriptionsByChannelId.get(id);
      const updatedCandle = candles[0];
      if (updatedCandle && subscriptionItem) {
        const bar = mapCandle(updatedCandle);
        subscriptionItem.lastBar = bar;
        // send data to every subscriber of that symbol
        Object.values(subscriptionItem.handlers).forEach(
          (handler: HandlerType) => {
            // if (currentCandleId === id) {
            //   const bar = mapCandle(updatedCandle);
            //   usePerpetualsStore.getState().setLastPrice(bar.close);
            // }
            handler.callback(bar);
          },
        );
      }
    }
  }

  private _clearSocket = (): void => {
    this.socket?.close();
    this.socket = null;
  };

  private isSocketOpen = (): boolean => {
    const readyState = this.socket?.getReadyState();
    return readyState === WebSocket.OPEN;
  };
}

export const websocketClient = new WebsocketClient();
// todo: can throw error
try {
  if (typeof window !== "undefined") {
    websocketClient.connect();
  }
} catch {}
