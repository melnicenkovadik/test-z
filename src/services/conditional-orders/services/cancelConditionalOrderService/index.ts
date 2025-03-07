import {
  ApiClient,
  CancelConditionalOrderParams as CancelConditionalOrderParamsSDK,
  CancelConditionalOrderResult as CancelConditionalOrderResultSDK,
} from "@reyaxyz/api-sdk";

export type CancelConditionalOrderParams = CancelConditionalOrderParamsSDK;
export type CancelConditionalOrderResult = CancelConditionalOrderResultSDK;

export const cancelConditionalOrderService = async (
  params: CancelConditionalOrderParams,
): Promise<CancelConditionalOrderResult> => {
  return await ApiClient.conditionalOrders.cancelConditionalOrder(params);
};
