import {
  transferMarginBetweenAccounts,
  TransferMarginBetweenAccountsParams,
  TransferMarginBetweenAccountsResult,
} from "@reyaxyz/sdk";

export type TransferBetweenMarginAccountParams =
  TransferMarginBetweenAccountsParams;
export type TransferBetweenMarginAccountResult =
  TransferMarginBetweenAccountsResult;

export const transferBetweenMarginAccountService = async (
  params: TransferBetweenMarginAccountParams,
): Promise<TransferBetweenMarginAccountResult> => {
  return await transferMarginBetweenAccounts(params);
};
