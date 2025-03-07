import {
  ApiClient,
  GetPoolPriceParams as GetPoolPriceParamsSDK,
  GetPoolPriceResult as GetPoolPriceResultSDK,
} from "@reyaxyz/api-sdk";

export type GetPoolPriceParams = GetPoolPriceParamsSDK;
export type GetPoolPriceResult = GetPoolPriceResultSDK;

export const getMarketPoolPriceService = async (
  params: GetPoolPriceParams,
): Promise<GetPoolPriceResult> => {
  return await ApiClient.markets.getPoolPrice(params);
};
