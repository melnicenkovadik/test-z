import {
  ApiClient,
  LimitTradeMaxOrderSizeParams as GetLimitTradeMaxOrderSizeParamsSDK,
  LimitTradeMaxOrderSizeResult as GetLimitTradeMaxOrderSizeResultSDK,
} from "@reyaxyz/api-sdk";

export type LimitTradeMaxOrderSizeParams = GetLimitTradeMaxOrderSizeParamsSDK;
export type LimitTradeMaxOrderSizeResult = GetLimitTradeMaxOrderSizeResultSDK;

export const getLimitOrderSizeAvailableService = ({
  triggerPrice,
}: LimitTradeMaxOrderSizeParams): LimitTradeMaxOrderSizeResult => {
  return ApiClient.tradeSimulation.getMaxAmountForLimitOrder({
    triggerPrice,
  });
};
