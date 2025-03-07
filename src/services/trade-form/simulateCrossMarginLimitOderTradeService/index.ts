import {
  ApiClient,
  SimulateLimitTradeEntity,
  TradeSimulationSimulateLimitParams,
} from "@reyaxyz/api-sdk";

export type SimulateCrossMarginLimitTradeParams =
  TradeSimulationSimulateLimitParams;
export type SimulateCrossMarginLimitTradeResult = SimulateLimitTradeEntity;

export const simulateCrossMarginLimitTradeService = (
  params: SimulateCrossMarginLimitTradeParams,
): SimulateCrossMarginLimitTradeResult => {
  try {
    const result = ApiClient.tradeSimulation.simulateLimit(params);
    return result;
  } catch (err) {
    throw err;
  }
};
