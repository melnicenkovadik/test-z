import {
  ApiClient,
  GetIsolatedOrderMaxSizeAvailableParams as GetIsolatedOrderMaxSizeAvailableParamsSDK,
  GetIsolatedOrderMaxSizeAvailableResult as GetIsolatedOrderMaxSizeAvailableResultSDK,
} from "@reyaxyz/api-sdk";

export type GetIsolatedTradeMaxAvailableSizeParams =
  GetIsolatedOrderMaxSizeAvailableParamsSDK;
export type GetIsolatedTradeMaxAvailableSizeResult =
  GetIsolatedOrderMaxSizeAvailableResultSDK;

export const getIsolatedOrderMaxSizeAvailableService = async ({
  marketId,
  marginAccountId,
  direction,
}: GetIsolatedTradeMaxAvailableSizeParams): Promise<GetIsolatedTradeMaxAvailableSizeResult> => {
  if (!marketId || !marginAccountId) {
    return {
      maxAmountBase: 0,
      maxAmountSize: 0,
    };
  }

  const getIsolatedOrderMaxSize =
    await ApiClient.account.getIsolatedOrderMaxSizeAvailable({
      direction,
      marginAccountId,
      marketId,
    });
  return getIsolatedOrderMaxSize;
};
