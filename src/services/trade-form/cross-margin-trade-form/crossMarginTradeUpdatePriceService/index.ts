import { ApiClient } from "@reyaxyz/api-sdk";

export const crossMarginTradeUpdatePriceService = (price: number) => {
  try {
    return ApiClient.tradeSimulation.updatePrice(price);
  } catch (err) {
    throw err;
  }
};
