import {
  ApiClient,
  IsolatedOrderSimulationLoadDataParams,
} from "@reyaxyz/api-sdk";

export type ArmSimulateIsolatedTradeParams =
  IsolatedOrderSimulationLoadDataParams;

export const armSimulateIsolatedTradeService = async (
  params: ArmSimulateIsolatedTradeParams,
): Promise<void> => {
  const armSimulateIsolatedTradeService =
    await ApiClient.isolatedSimulation.arm(params);

  return armSimulateIsolatedTradeService;
};
