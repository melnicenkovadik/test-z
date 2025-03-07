import {
  ApiClient,
  GetMaxWithdrawBalanceForAccountParams,
  GetMaxWithdrawBalanceForAccountResult,
} from "@reyaxyz/api-sdk";

export type GetMarginAccountWithdrawBalanceParams =
  GetMaxWithdrawBalanceForAccountParams;
export type GetMarginAccountWithdrawBalanceResult =
  GetMaxWithdrawBalanceForAccountResult;

export const getMarginAccountWithdrawBalanceService = async (
  params: GetMarginAccountWithdrawBalanceParams,
): Promise<GetMarginAccountWithdrawBalanceResult> => {
  return await ApiClient.account.getMaxWithdrawBalanceForAccount(params);
};
