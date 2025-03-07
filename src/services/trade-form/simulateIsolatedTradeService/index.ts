import {
  ApiClient,
  IsolatedOrderSimulationSimulateParams,
  SimulateIsolatedOrderEntity as SimulateIsolatedOrderEntitySDK,
} from "@reyaxyz/api-sdk";

export type SimulateIsolatedTradeParams = IsolatedOrderSimulationSimulateParams;
export type SimulateIsolatedTradeResult = SimulateIsolatedOrderEntitySDK;

export const simulateIsolatedTradeService = (
  params: SimulateIsolatedTradeParams,
): SimulateIsolatedTradeResult => {
  try {
    return ApiClient.isolatedSimulation.simulate(params);
  } catch (err) {
    throw err;
  }
};
