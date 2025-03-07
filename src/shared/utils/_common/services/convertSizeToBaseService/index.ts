import { ApiClient, TradeSimulationConvertValueResult } from "@reyaxyz/api-sdk";

export const convertSizeToBaseService = (params: {
  amount: number;
}): TradeSimulationConvertValueResult => {
  try {
    const res = ApiClient.tradeSimulation.convertValueEstimatedPrice({
      amount: params.amount,
      fromBase: false,
    });
    return res;
  } catch {
    return 0;
  }
};
