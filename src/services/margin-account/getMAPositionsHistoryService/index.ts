import {
  ApiClient,
  GetMarginAccountOrderHistoryPaginatedParams,
} from "@reyaxyz/api-sdk";

export const getMAPositionsHistoryService = (
  params: GetMarginAccountOrderHistoryPaginatedParams,
): Promise<any> => {
  const data = ApiClient.account.getMarginAccountOrderHistoryPaginated(
    params as GetMarginAccountOrderHistoryPaginatedParams,
  );
  return data;
};
