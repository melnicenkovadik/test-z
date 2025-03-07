import {
  ApiClient,
  GetMarginAccountsParams as GetMarginAccountsParamsSDK,
  GetMarginAccountsResult as GetMarginAccountsResultSDK,
} from "@reyaxyz/api-sdk";

import { cachedFetcher } from "@/shared/utils/cached-fetcher";

export type GetMarginAccountsResult = GetMarginAccountsResultSDK;
export type GetMarginAccountsParams = GetMarginAccountsParamsSDK;

export const getMarginAccountsService = cachedFetcher<
  GetMarginAccountsParams,
  GetMarginAccountsResult
>({
  cacheDuration: 1000,
  fetcher: (params: GetMarginAccountsParams) =>
    ApiClient.account.getMarginAccounts(params),
  key: "getMarginAccountsService",
});
