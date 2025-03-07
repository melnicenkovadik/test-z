import {
  ApiClient,
  GetConditionalOrdersHistoryForMarginAccountParams as GetConditionalOrdersHistoryForMarginAccountParamsSDK,
  GetConditionalOrdersHistoryForMarginAccountResult as GetConditionalOrdersHistoryForMarginAccountResultSDK,
  GetConditionalOrdersHistoryForWalletAddressParams as GetConditionalOrdersHistoryForWalletAddressParamsSDK,
  UnifiedConditionalOrderType as UnifiedConditionalOrderTypeSDK,
} from "@reyaxyz/api-sdk";

export type GetConditionalOrdersHistoryForMarginAccountParams =
  GetConditionalOrdersHistoryForMarginAccountParamsSDK;
export type GetConditionalOrdersHistoryForWalletAddressParams =
  GetConditionalOrdersHistoryForWalletAddressParamsSDK;
export type GetConditionalOrdersHistoryForMarginAccountResult =
  GetConditionalOrdersHistoryForMarginAccountResultSDK;
export type ConditionalOrderHistoryEvent =
  GetConditionalOrdersHistoryForMarginAccountResult[0];
export type UnifiedConditionalOrderType = UnifiedConditionalOrderTypeSDK;
export enum ConditionalOrderStatus {
  CANCELLED = "cancelled",
  FILLED = "filled",
  PENDING = "pending",
  REJECTED = "rejected",
}

export const getConditionalOrdersHistoryForMarginAccountService = async (
  params: GetConditionalOrdersHistoryForMarginAccountParams,
): Promise<GetConditionalOrdersHistoryForMarginAccountResult> => {
  return await ApiClient.conditionalOrders.getConditionalOrdersHistoryForMarginAccount(
    params,
  );
};

export const getConditionalOrdersHistoryForWalletService = async (
  params: GetConditionalOrdersHistoryForWalletAddressParams,
): Promise<GetConditionalOrdersHistoryForMarginAccountResult> => {
  return await ApiClient.conditionalOrders.getConditionalOrdersHistoryForWalletAddress(
    params,
  );
};
