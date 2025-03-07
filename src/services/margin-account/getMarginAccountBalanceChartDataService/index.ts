import {
  ApiClient,
  GetMarginAccountBalanceChartDataParams as GetMarginAccountBalanceChartDataParamsSDK,
  GetMarginAccountBalanceChartDataResult as GetMarginAccountBalanceChartDataResultSDK,
} from "@reyaxyz/api-sdk";

export type GetMarginAccountBalanceChartDataResult =
  GetMarginAccountBalanceChartDataResultSDK;
export type GetMarginAccountBalanceChartDataParams =
  GetMarginAccountBalanceChartDataParamsSDK;

export const getMarginAccountBalanceChartDataService = async (
  params: GetMarginAccountBalanceChartDataParams,
): Promise<GetMarginAccountBalanceChartDataResult> => {
  return await ApiClient.account.getMarginAccountBalanceChartData(params);
};
