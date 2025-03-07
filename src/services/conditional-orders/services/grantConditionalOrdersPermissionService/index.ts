import {
  grantTradePermission,
  GrantTradePermissionParams as GrantTradePermissionParamsSDK,
  GrantTradePermissionResult as GrantTradePermissionResultSDK,
} from "@reyaxyz/sdk";

export type GrantTradePermissionParams = GrantTradePermissionParamsSDK;
export type GrantTradePermissionResult = GrantTradePermissionResultSDK;

export const grantConditionalOrdersPermissionService = async (
  params: GrantTradePermissionParams,
): Promise<GrantTradePermissionResult> => {
  console.log("params", params);
  return await grantTradePermission(params);
};
