import {
  ApiClient,
  GetMaxOrderSizeAvailableParams as GetMaxOrderSizeAvailableParamsSDK,
  GetMaxOrderSizeAvailableResult as GetMaxOrderSizeAvailableResultSDK,
} from "@reyaxyz/api-sdk";

export type GetMaxOrderSizeAvailableParams = GetMaxOrderSizeAvailableParamsSDK;
export type GetMaxOrderSizeAvailableResult = GetMaxOrderSizeAvailableResultSDK;

export const getMaxOrderSizeAvailableService = async ({
  marketId,
  marginAccountId,
  direction,
}: GetMaxOrderSizeAvailableParams): Promise<GetMaxOrderSizeAvailableResult> => {
  if (!marketId || !marginAccountId) {
    return {
      maxAmountBase: 0,
      maxAmountSize: 0,
    };
  }
  return await ApiClient.account.getMaxOrderSizeAvailable({
    direction,
    marginAccountId,
    marketId,
  });
};
