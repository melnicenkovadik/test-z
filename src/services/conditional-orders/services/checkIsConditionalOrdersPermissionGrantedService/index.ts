import {
  AlreadyGaveTradePermissionParams,
  AlreadyGaveTradePermissionResult,
  ApiClient,
} from "@reyaxyz/api-sdk";

export type CheckIsTradePermissionGrantedParams =
  AlreadyGaveTradePermissionParams;
export type CheckIsTradePermissionGrantedResult =
  AlreadyGaveTradePermissionResult;

export const checkIsConditionalOrdersPermissionGrantedService = async (
  params: CheckIsTradePermissionGrantedParams,
): Promise<CheckIsTradePermissionGrantedResult> => {
  return await ApiClient.conditionalOrders.alreadyGaveTradePermissions(params);
};
