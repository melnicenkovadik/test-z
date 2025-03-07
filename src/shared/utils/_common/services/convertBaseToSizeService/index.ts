import { ApiClient, TradeSimulationConvertValueResult } from "@reyaxyz/api-sdk";

export const convertBaseToSizeService = (params: {
  amount: number;
}): TradeSimulationConvertValueResult => {
  try {
    const res = ApiClient.tradeSimulation.convertValueEstimatedPrice({
      amount: params.amount,
      fromBase: false,
    });
    return res;
  } catch (err) {
    console.error("convertBaseToSizeService error", err);
    return 0;
  }
};
