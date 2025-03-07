import {
  ApiClient,
  UpdateLeverageForAccountAndMarketParams as UpdateLeverageForAccountAndMarketParamsSDK,
  UpdateLeverageForAccountAndMarketResult as UpdateLeverageForAccountAndMarketResultSDK,
} from "@reyaxyz/api-sdk";

export type UpdateLeverageForAccountAndMarketParams =
  UpdateLeverageForAccountAndMarketParamsSDK;
export type UpdateLeverageForAccountAndMarketResult =
  UpdateLeverageForAccountAndMarketResultSDK;
export const updateCustomLeverageService = async (
  params: UpdateLeverageForAccountAndMarketParams,
): Promise<UpdateLeverageForAccountAndMarketResult> => {
  return ApiClient.account.updateLeverageForAccountAndMarket(params);
};
