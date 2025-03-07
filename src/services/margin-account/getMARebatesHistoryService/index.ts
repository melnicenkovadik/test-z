import {
  ApiClient,
  GetAccountFeeRebatesHistoryParams,
  GetAccountFeeRebatesHistoryResult,
} from "@reyaxyz/api-sdk";

export type GetMARebatesHistoryResult = GetAccountFeeRebatesHistoryResult;
export type GetMARebatesHistoryParams = GetAccountFeeRebatesHistoryParams;

export const getMARebatesHistoryService = async (
  params: GetMARebatesHistoryParams,
): Promise<GetMARebatesHistoryResult> => {
  return await ApiClient.account.getAccountFeeRebatesHistory(params);
};
