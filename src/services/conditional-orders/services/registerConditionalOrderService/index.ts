import {
  ApiClient,
  ConditionalOrderType as ConditionalOrderTypeSDK,
  RegisterConditionalOrderParams as RegisterConditionalOrderParamsSDK,
  RegisterConditionalOrderResult as RegisterConditionalOrderResultSDK,
} from "@reyaxyz/api-sdk";

export type RegisterConditionalOrderParams = RegisterConditionalOrderParamsSDK;
export type RegisterConditionalOrderResult = RegisterConditionalOrderResultSDK;
export const ConditionalOrderMap = ConditionalOrderTypeSDK;
export type ConditionalOrderType = ConditionalOrderTypeSDK;

export const registerConditionalOrderService = async (
  params: RegisterConditionalOrderParams,
): Promise<RegisterConditionalOrderResult> => {
  return await ApiClient.conditionalOrders.registerConditionalOrder(params);
};
