import {
  ApiClient,
  EstimatedPriceParams,
  EstimatedPriceResult as EstimatedPriceResultSDK,
} from "@reyaxyz/api-sdk";

export type EstimatedPriceResult = EstimatedPriceResultSDK;
export const getIsolatedTradeEstimatedPriceService = (
  params: EstimatedPriceParams,
): EstimatedPriceResult => {
  try {
    return ApiClient.isolatedSimulation.estimatedPrice({
      amount: params.amount,
    });
  } catch (err) {
    console.error("getIsolatedTradeEstimatedPriceService error", err);
    return {
      estimatedPrice: 0,
      markPrice: 0,
    };
  }
};
