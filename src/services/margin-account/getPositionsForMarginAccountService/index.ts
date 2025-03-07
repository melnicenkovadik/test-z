import {
  ApiClient,
  GetPositionsForMarginAccountParams,
} from "@reyaxyz/api-sdk";

import { cachedFetcher } from "@/shared/utils/cached-fetcher";

export const getPositionsForMarginAccountService = cachedFetcher({
  cacheDuration: 1000,
  fetcher: (params: GetPositionsForMarginAccountParams) => {
    const data = ApiClient.account.getPositionsForMarginAccount(params);
    return data;
  },
  key: "getMAPositionsHistoryService",
});
