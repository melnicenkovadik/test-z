import { getAllowance, GetAllowanceParams } from "@reyaxyz/sdk";

export const getTokenAllowanceService = async (
  params: GetAllowanceParams,
): Promise<number> => {
  return await getAllowance(params);
};
