import {
  ApiClient,
  GetAllowedTokenResult as GetAllowedTokenResultSDK,
  GetAllowedTokensParams as GetAllowedTokensParamsSDK,
} from "@reyaxyz/api-sdk";

export type GetAllowedTokensParams = GetAllowedTokensParamsSDK;
export type GetAllowedTokenResult = GetAllowedTokenResultSDK;

export const getAllowedTokensService = async (
  params: GetAllowedTokensParams,
): Promise<GetAllowedTokenResult> => {
  return await ApiClient.tokens.getAllowedTokens(params);
};
