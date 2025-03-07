import {
  isolatedOrder,
  IsolatedOrderParams,
  IsolatedOrderResult,
} from "@reyaxyz/sdk";

export type IsolatedTradeParams = IsolatedOrderParams;
export type IsolatedTradeResult = IsolatedOrderResult;

export const isolatedTradeService = async (
  params: IsolatedTradeParams,
): Promise<IsolatedTradeResult> => {
  console.log("isolatedTradeService params", params);
  const result = await isolatedOrder(params);
  console.log("isolatedTradeService result", result);
  return result;
};
