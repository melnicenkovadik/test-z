import {
  ApiClient,
  EstimatedPriceParams,
  EstimatedPriceResult as EstimatedPriceResultSDK,
} from "@reyaxyz/api-sdk";

export type EstimatedPriceResult = EstimatedPriceResultSDK;
export const getCrossMarginTradeEstimatedPriceService = (
  params: EstimatedPriceParams,
): EstimatedPriceResult => {
  try {
    return ApiClient.tradeSimulation.estimatedPrice({
      amount: params.amount,
    });
  } catch {
    return {
      estimatedPrice: 0,
      markPrice: 0,
    };
  }
};
