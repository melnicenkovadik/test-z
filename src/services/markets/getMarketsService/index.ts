import {
  ApiClient,
  GetMarketsResult as GetMarketsResultSDK,
} from "@reyaxyz/api-sdk";

import { cachedFetcher } from "@/shared/utils/cached-fetcher";

export type GetMarketsResult = GetMarketsResultSDK;

export const getMarketsService = cachedFetcher<void, GetMarketsResult>({
  cacheDuration: 1000,
  fetcher: () => ApiClient.markets.getMarkets(),
  key: "getMarkets",
});
