import { ApiClient } from "@reyaxyz/api-sdk";

export const getCustomLeverageService = () => {
  return ApiClient.tradeSimulation.customLeverage();
};
