import {
  revokeTradePermission,
  RevokeTradePermissionParams as RevokeTradePermissionParamsSDK,
  RevokeTradePermissionResult as RevokeTradePermissionResultSDK,
} from "@reyaxyz/sdk";

export type RevokeTradePermissionParams = RevokeTradePermissionParamsSDK;
export type RevokeTradePermissionResult = RevokeTradePermissionResultSDK;

export const revokeTradePermissionService = async (
  params: RevokeTradePermissionParams,
): Promise<RevokeTradePermissionResult> => {
  return await revokeTradePermission(params);
};
