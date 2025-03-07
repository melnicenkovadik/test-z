import {
  AlreadyGaveTradePermissionToWalletParams,
  AlreadyGaveTradePermissionToWalletResult,
  ApiClient,
} from "@reyaxyz/api-sdk";

export type CheckIsTradePermissionGrantedToEmbeddedWalletParams =
  AlreadyGaveTradePermissionToWalletParams;
export type CheckIsTradePermissionGrantedToEmbeddedWalletResult =
  AlreadyGaveTradePermissionToWalletResult;

export const checkIsConditionalOrdersPermissionGrantedToEmbeddedWalletService =
  async (
    params: AlreadyGaveTradePermissionToWalletParams,
  ): Promise<AlreadyGaveTradePermissionToWalletResult> => {
    return await ApiClient.conditionalOrders.alreadyGaveTradePermissionToWallet(
      params,
    );
  };
