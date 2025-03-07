import { ApiClient, TradeSimulationLoadDataParams } from "@reyaxyz/api-sdk";

export type ArmSimulateCrossMarginTradeParams = TradeSimulationLoadDataParams;

export const armSimulateCrossMarginTradeService = async (
  params: ArmSimulateCrossMarginTradeParams,
): Promise<void> => {
  const armSimulateCrossMarginTradeService =
    await ApiClient.tradeSimulation.arm(params);
  return armSimulateCrossMarginTradeService;
};
