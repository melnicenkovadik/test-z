import {
  ApiClient,
  UpdateConditionalOrderParams as UpdateSLOrderParamsSDK,
  UpdateConditionalOrderResult as UpdateSLOrderResultSDK,
} from "@reyaxyz/api-sdk";

export type UpdateConditionalOrderParams = UpdateSLOrderParamsSDK;
export type UpdateConditionalOrderResult = UpdateSLOrderResultSDK;

export const updateConditionalOrderService = async (
  params: UpdateConditionalOrderParams,
): Promise<UpdateConditionalOrderResult> => {
  return await ApiClient.conditionalOrders.updateConditionalOrder(params);
};
