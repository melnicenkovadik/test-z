import {
  ApiClient,
  EditMarginAccountParams as EditMarginAccountParamsSDK,
  EditMarginAccountResult as EditMarginAccountResultSDK,
} from "@reyaxyz/api-sdk";

export type EditMarginAccountResult = EditMarginAccountResultSDK;
export type EditMarginAccountParams = EditMarginAccountParamsSDK;

export const editMarginAccountService = async (
  params: EditMarginAccountParams,
): Promise<EditMarginAccountResult> => {
  return await ApiClient.account.editMarginAccount(params);
};
