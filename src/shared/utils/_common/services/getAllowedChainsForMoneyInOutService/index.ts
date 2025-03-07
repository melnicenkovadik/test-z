import {
  getAllowedChainsForMoneyInOut,
  GetAllowedChainsForMoneyInOutParams as GetAllowedChainsForMoneyInOutParamsSDK,
  GetAllowedChainsForMoneyInOutResult as GetAllowedChainsForMoneyInOutResultSDK,
} from "@reyaxyz/sdk";

export type GetAllowedChainsForMoneyInOutResult =
  GetAllowedChainsForMoneyInOutResultSDK;
export type GetAllowedChainsForMoneyInOutParams =
  GetAllowedChainsForMoneyInOutParamsSDK;

export const getAllowedChainsForMoneyInOutService = (
  params: GetAllowedChainsForMoneyInOutParams,
): GetAllowedChainsForMoneyInOutResult => {
  try {
    return getAllowedChainsForMoneyInOut(params);
  } catch (err) {
    throw err;
  }
};
