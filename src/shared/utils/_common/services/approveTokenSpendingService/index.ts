import { ApproveTokenParams, approveTokenSpending } from "@reyaxyz/sdk";

export const approveTokenSpendingService = async (
  params: ApproveTokenParams,
): Promise<number> => {
  return await approveTokenSpending(params);
};
