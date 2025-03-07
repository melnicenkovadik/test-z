"use client";
import {
  ApiClient,
  type GetOwnerMetadataParams,
  type GetOwnerMetadataResult,
  type GetPositionsForMarginAccountParams,
  type SimulateTradeEntity,
  type TradeSimulationLoadDataParams,
  type TradeSimulationSimulateParams,
} from "@reyaxyz/api-sdk";
import {
  type GetMarginAccountParams,
  type GetMarginAccountResult,
  type GetPositionsForMarginAccountResult,
} from "@reyaxyz/api-sdk/src/clients/types";
import {
  ApprovalType,
  type ApproveTokenParams,
  approveTokenSpending,
  bridgeAndDepositExistingMA,
  type BridgeAndDepositExistingMAParams,
  type BridgeAndDepositExistingMAResult,
  configureSDK,
  createAccount,
  type CreateAccountParams,
  type CreateAccountResult,
  withdrawMAAndBridge,
  type WithdrawMAAndBridgeParams,
  type WithdrawMAAndBridgeParamsResult,
} from "@reyaxyz/sdk";
import { Signer } from "ethers";

import { useMarketStore } from "@/shared/store/useMarketStore";

import {
  getMarginAccountsService,
  mapMarginAccountToMarginAccountUI,
} from "src/shared/utils/_common";

type TradeSimulationConvertValueParams = {
  amount: number;
  fromBase: boolean;
};

type CancelConditionalOrderParams = {
  signer: Signer;
  orderId: string;
};

let isReyaLibInitialized = false;

export const initReyaLib = () => {
  if (!isReyaLibInitialized) {
    const env = "production";

    ApiClient.configure(env);
    configureSDK(env);
    isReyaLibInitialized = true;
  }
};

export const getOrCreateMainAccount = async (
  address: string,
  currentAccId: number | undefined,
): Promise<any> => {
  const accounts = await getMarginAccountsService({ address });
  const wrappedAccounts =
    accounts?.map((account) => {
      const markets = useMarketStore.getState().markets;
      const marketMap = markets.reduce((acc, m) => {
        // @ts-ignore
        acc[m.id] = m;
        return acc;
      }, {});

      const positions = account.positions
        ? account.positions.map((position) => {
            // @ts-ignore
            const market = marketMap[position.marketId];
            return {
              ...position,
              market,
            };
          })
        : null;
      // @ts-ignore
      account.positions = positions;
      return mapMarginAccountToMarginAccountUI(account);
    }) || [];

  const mainAccount =
    wrappedAccounts.find((account) => account.id === currentAccId) ||
    wrappedAccounts?.[0] ||
    null;
  if (mainAccount === null) {
    const result = await createMainAccount(address);
    return {
      wrappedAccounts: wrappedAccounts,
      // @ts-ignore
      updatedUser: retrieveAccount(address, result.accountId as number),
    };
  }

  return { accounts: wrappedAccounts, updatedUser: mainAccount };
};

export const getOwnerMetadata = async (
  address: string,
): Promise<GetOwnerMetadataResult> => {
  const params: GetOwnerMetadataParams = {
    ownerAddress: address,
  };
  return await new Promise((resolve, reject) => {
    try {
      resolve(ApiClient.owner.getOwnerMetadata(params));
    } catch (err) {
      reject(err);
    }
  });
};

let cachedAccounts: any = null;
export const createMainAccount = async (
  address: string,
  name: string = "zeuz-main",
): Promise<CreateAccountResult | null> => {
  const params: CreateAccountParams = {
    ownerAddress: address,
    name: name,
  };
  if (cachedAccounts && cachedAccounts.includes(address)) {
    return null;
  }
  const newAcc = await createAccount(params);
  cachedAccounts = [...cachedAccounts, address];
  return newAcc;
};

export const retrieveAccount = async (
  address: string,
  id: number,
): Promise<GetMarginAccountResult> => {
  const params: GetMarginAccountParams = {
    address: address,
    marginAccountId: id,
  };
  console.log("retrievedAccount params", params);
  const retrievedAccount = await ApiClient.account.getMarginAccount(params);
  console.log("retrievedAccount", retrievedAccount);
  const result = mapMarginAccountToMarginAccountUI(retrievedAccount);
  console.log("retrievedAccount + pos + result", result);
  return result;
};

interface DepositExistingMASimulationSimulateParams {
  moneyInOutChainId: number;
  amount: number;
  tokenAddress: string;
}

export const simulateDepositIntoMarginAccountService = async (
  params: any,
): Promise<any> => {
  return await new Promise((resolve, reject) => {
    try {
      resolve(ApiClient.depositExistingMASimulation.simulate(params));
    } catch (err) {
      console.error("simulateDepositIntoMarginAccountService error", err);
      reject(err);
    }
  });
};
export const doDeposit = async (
  signer: Signer,
  accountId: number,
  tokenAddress: string,
  moneyInOutChainId: number,
  amount: number,
): Promise<BridgeAndDepositExistingMAResult> => {
  await ApiClient.depositExistingMASimulation.arm({
    marginAccountId: accountId,
  });

  const simulateParams: DepositExistingMASimulationSimulateParams = {
    moneyInOutChainId: moneyInOutChainId,
    amount: +amount,
    // @ts-ignore
    tokenAddress: tokenAddress,
  };

  const simulation =
    await simulateDepositIntoMarginAccountService(simulateParams);

  const params: BridgeAndDepositExistingMAParams = {
    amount: +amount,
    marginAccountId: accountId,
    // @ts-ignore
    signer: signer as Signer,
    socketDepositFees: simulation.socketDepositFees.fees,
    // @ts-ignore
    tokenAddress: tokenAddress,
  };

  const result = await bridgeAndDepositExistingMA(params);
  return result;
};

export const doWithdraw = async (
  signer: Signer,
  accountId: number,
  ownerAddress: string,
  tokenAddress: string,
  amount: number,
  moneyInOutChainId: number,
  coreSigNonce: number,
  errorCb: any,
): Promise<WithdrawMAAndBridgeParamsResult | null> => {
  try {
    const params = {
      amount,
      marginAccountId: accountId,
      moneyInOutChainId,
      owner: {
        address: ownerAddress,
        coreSigNonce,
      },
      // receiverAddress: ownerAddress,
      receiverAddress: undefined,
      signer,
      tokenAddress: "0xa9F32a851B1800742e47725DA54a09A7Ef2556A3",
    };
    // console.log("params", params);
    const result = await withdrawMAAndBridge(
      params as unknown as WithdrawMAAndBridgeParams,
    );
    return result;
  } catch (error) {
    errorCb(error);
    // @ts-ignore
    console.error("Withdraw error:", error?.message);
    return null;
  }
};

export const approveBridge = async (
  signer: Signer,
  tokenAddress: string,
  amount: number,
) => {
  const request = await approveAction(
    signer,
    tokenAddress,
    amount,
    ApprovalType.BRIDGE,
  );
  return request;
};

export const approveAction = async (
  signer: Signer,
  tokenAddress: string,
  amount: number,
  type: any,
) => {
  // @ts-ignore
  const input: ApproveTokenParams = {
    // @ts-ignore
    signer: signer,
    // @ts-ignore
    tokenAddress: tokenAddress,
    amount: amount,
    type: type,
  };
  await approveTokenSpending(input);
};

export const setMarketAndMAForSimulation = (
  marketId: number,
  marginAccountId: number,
): Promise<void> => {
  const armParams: TradeSimulationLoadDataParams = {
    marketId: marketId,
    marginAccountId: marginAccountId,
  };

  return ApiClient.tradeSimulation.arm(armParams);
};

export const simulateTrade = async (
  amount: number,
): Promise<SimulateTradeEntity> => {
  const params: TradeSimulationSimulateParams = {
    amount: amount,
  };

  return ApiClient.tradeSimulation.simulate(params);
};

export const convertValue = (amount: number, fromBase: boolean): number => {
  const params: TradeSimulationConvertValueParams = {
    amount: amount,
    fromBase: fromBase,
  };

  return ApiClient.tradeSimulation.convertValue(params);
};

interface CancelConditionalOrderResult {
  orderId: string;
  status: string;
}

export const closeLimitOrders = async (
  ids: string[],
  wallet: Signer,
): Promise<Awaited<CancelConditionalOrderResult>[]> => {
  const promises = ids.map((id) => {
    const params: CancelConditionalOrderParams = {
      // @ts-ignore
      signer: wallet,
      orderId: id,
    };

    // @ts-ignore
    return ApiClient.conditionalOrders.cancelConditionalOrder(params);
  });

  return Promise.all(promises);
};

export const getPositions = async (
  address: string,
  accountId: number,
): Promise<GetPositionsForMarginAccountResult> => {
  if (address === undefined || accountId === undefined) {
    const history = {
      positions: [],
      totalUnrealizedPNL: 0,
    };

    return Promise.resolve(history);
  }

  const params: GetPositionsForMarginAccountParams = {
    address: address,
    marginAccountId: accountId,
  };

  return ApiClient.account.getPositionsForMarginAccount(params);
};
