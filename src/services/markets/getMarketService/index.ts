import {
  ApiClient,
  GetMarketParams,
  GetMarketResult as GetMarketResultSDK,
} from "@reyaxyz/api-sdk";

export type GetMarketResult = GetMarketResultSDK;

export const getMarketService = async (
  params: GetMarketParams,
): Promise<GetMarketResult> => {
  return ApiClient.markets.getMarket(params);
};
