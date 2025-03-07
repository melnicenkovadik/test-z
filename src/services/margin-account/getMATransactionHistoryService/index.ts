import {
  ApiClient,
  GetMarginAccountTransactionHistoryParams,
  GetMarginAccountTransactionHistoryResult,
} from "@reyaxyz/api-sdk";

import { cachedFetcher } from "@/shared/utils/cached-fetcher";

export type GetMATransactionHistoryResult =
  GetMarginAccountTransactionHistoryResult;
export type GetMATransactionHistoryParams =
  GetMarginAccountTransactionHistoryParams;

export const getMATransactionHistoryService = cachedFetcher<
  GetMATransactionHistoryParams,
  GetMATransactionHistoryResult
>({
  cacheDuration: 1000,
  fetcher: (params: GetMATransactionHistoryParams) => {
    return ApiClient.account.getMarginAccountTransactionHistory(params);
  },
  key: "getMATransactionHistoryService",
});
