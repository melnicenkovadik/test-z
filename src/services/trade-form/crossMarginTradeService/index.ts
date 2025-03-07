import { matchOrder, MatchOrderParams, MatchOrderResult } from "@reyaxyz/sdk";

export type CrossMarginTradeParams = MatchOrderParams;
export type CrossMarginTradeResult = MatchOrderResult;

export const crossMarginTradeService = async (
  params: CrossMarginTradeParams,
): Promise<CrossMarginTradeResult> => {
  return await matchOrder(params);
};
