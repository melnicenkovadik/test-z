import { closeOrder, CloseOrderParams, CloseOrderResult } from "@reyaxyz/sdk";

export type ClosePositionParams = CloseOrderParams;
export type ClosePositionResult = CloseOrderResult;

export const closePositionService = async (
  params: ClosePositionParams,
): Promise<ClosePositionResult> => {
  return await closeOrder(params);
};
