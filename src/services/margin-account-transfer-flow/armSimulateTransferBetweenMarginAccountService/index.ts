import {
  ApiClient,
  TransferMarginBetweenMAsSimulationLoadDataParams,
} from "@reyaxyz/api-sdk";

export type ArmSimulateTransferBetweenMarginAccountParams =
  TransferMarginBetweenMAsSimulationLoadDataParams;

export const armSimulateTransferBetweenMarginAccountService = async (
  params: ArmSimulateTransferBetweenMarginAccountParams,
): Promise<void> => {
  return await ApiClient.transferMarginBetweenMAsSimulation.arm(params);
};
