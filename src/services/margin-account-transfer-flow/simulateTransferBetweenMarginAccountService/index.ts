import {
  ApiClient,
  SimulateTransferMarginBetweenMAsEntity,
  TransferMarginBetweenMAsSimulationSimulateParams,
} from "@reyaxyz/api-sdk";

export type SimulateTransferBetweenMarginAccountEntity =
  SimulateTransferMarginBetweenMAsEntity;
export type SimulateTransferBetweenMarginAccountParams =
  TransferMarginBetweenMAsSimulationSimulateParams;

export const simulateTransferBetweenMarginAccountService = async (
  params: SimulateTransferBetweenMarginAccountParams,
): Promise<SimulateTransferBetweenMarginAccountEntity> => {
  return await new Promise((resolve, reject) => {
    try {
      resolve(ApiClient.transferMarginBetweenMAsSimulation.simulate(params));
    } catch (err) {
      reject(err);
    }
  });
};
