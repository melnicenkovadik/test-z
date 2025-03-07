// FILE: src/shared/portfolio/TradePermission/useTradePermissionStore.ts

import { AlreadyGaveTradePermissionToWalletParams } from "@reyaxyz/api-sdk";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
  checkIsConditionalOrdersPermissionGrantedService,
  checkIsConditionalOrdersPermissionGrantedToEmbeddedWalletService,
  grantConditionalOrdersPermissionService,
  GrantTradePermissionParams,
  GrantTradePermissionResult,
} from "@/services/conditional-orders/services";
import {
  revokeTradePermissionService,
  RevokeTradePermissionParams,
  RevokeTradePermissionResult,
} from "@/services/conditional-orders/services/revokeTradePermissionService";
import useUserStore, {
  refreshWalletMetadata,
  selectWalletMetadata,
} from "@/shared/store/user.store";

type TradePermissionState = {
  isTradePermissionGranted: boolean;
  isTradePermissionGrantedForEmbeddedWallet: boolean;
  isGrantTradePermissionLoading: boolean;
  isGrantTradePermissionLoadingForEmbeddedWallet: boolean;
  grantPermissionError: Error | null;
  grantPermissionErrorForEmbeddedWallet: Error | null;
  isRevokeTradePermissionLoading: boolean;
  revokePermissionError: Error | null;
  isRevokeTradePermissionLoadingForEmbeddedWallet: boolean;
  revokePermissionErrorForEmbeddedWallet: Error | null;
};

type TradePermissionActions = {
  grantTradePermission: (params: any) => Promise<GrantTradePermissionResult>;
  grantTradePermissionToEmbeddedWallet: (
    params: any,
  ) => Promise<GrantTradePermissionResult>;
  checkIsConditionalOrdersPermissionGranted: (
    accountId?: number,
  ) => Promise<boolean>;
  checkIsConditionalOrdersPermissionGrantedToEmbeddedWallet: (
    accountId?: number,
  ) => Promise<boolean>;
  revokeTradePermission: (
    params: Omit<RevokeTradePermissionParams, "owner">,
  ) => Promise<RevokeTradePermissionResult>;
  revokeTradePermissionToEmbeddedWallet: (
    params: Omit<RevokeTradePermissionParams, "owner">,
  ) => Promise<RevokeTradePermissionResult>;
};

const rejectThunkWithError = (error: Error) => {
  console.error("Error in trade permission operation:", error);
  return Promise.reject(error);
};

export const useTradePermissionStore = create<
  TradePermissionState & TradePermissionActions
>()(
  devtools((set, get) => ({
    isTradePermissionGranted: false,
    isTradePermissionGrantedForEmbeddedWallet: false,
    isGrantTradePermissionLoading: true,
    isGrantTradePermissionLoadingForEmbeddedWallet: true,
    grantPermissionError: null,
    grantPermissionErrorForEmbeddedWallet: null,
    isRevokeTradePermissionLoading: false,
    revokePermissionError: null,
    isRevokeTradePermissionLoadingForEmbeddedWallet: false,
    revokePermissionErrorForEmbeddedWallet: null,

    grantTradePermission: async ({ signer, accountId }) => {
      console.log("grantTradePermission", accountId);
      console.log(
        "useUserStore?.getState()?.user?.id",
        useUserStore?.getState()?.user?.id,
      );
      try {
        if (!useUserStore?.getState()?.user?.id) {
          const error = new Error("Invalid accountId!");
          set({
            isGrantTradePermissionLoading: false,
            grantPermissionError: error,
          });
          return rejectThunkWithError(error);
        }

        const { isTradePermissionGranted } = get();
        if (isTradePermissionGranted) {
          return;
        }

        set({
          isGrantTradePermissionLoading: true,
          grantPermissionError: null,
        });

        const { coreSigNonce, address } = selectWalletMetadata() || {};

        if (!address || !coreSigNonce || !signer) {
          const error = new Error("Invalid wallet metadata!");
          set({
            isGrantTradePermissionLoading: false,
            grantPermissionError: error,
          });
          return rejectThunkWithError(error);
        }

        const params = {
          accountId: accountId || useUserStore?.getState()?.user?.id,
          owner: { coreSigNonce },
          permissionTarget: undefined,
          signer,
        } as GrantTradePermissionParams;
        console.log("grantConditionalOrdersPermissionService", params);
        const result = await grantConditionalOrdersPermissionService(params);
        console.log("grantConditionalOrdersPermissionService result", result);
        refreshWalletMetadata();
        set({
          isTradePermissionGranted: true,
          isGrantTradePermissionLoading: false,
          grantPermissionError: null,
        });

        return result;
      } catch (error: any) {
        if (error?.message === "ValueAlreadyInSet") {
          set({
            isTradePermissionGranted: true,
            isGrantTradePermissionLoading: false,
          });
          return;
        }
        set({
          isGrantTradePermissionLoading: false,
          grantPermissionError: error,
        });
        return rejectThunkWithError(error);
      }
    },

    grantTradePermissionToEmbeddedWallet: async ({ signer, accountId }) => {
      console.log("grantTradePermissionToEmbeddedWallet", accountId);
      console.log(
        "useUserStore?.getState()?.user?.id",
        useUserStore?.getState()?.user?.id,
      );
      try {
        if (!useUserStore?.getState()?.user?.id) {
          const error = new Error("Invalid accountId!");
          set({
            isGrantTradePermissionLoadingForEmbeddedWallet: false,
            grantPermissionErrorForEmbeddedWallet: error,
          });
          return rejectThunkWithError(error);
        }

        const { isTradePermissionGrantedForEmbeddedWallet } = get();
        if (isTradePermissionGrantedForEmbeddedWallet) {
          return;
        }

        set({
          isGrantTradePermissionLoadingForEmbeddedWallet: true,
          grantPermissionErrorForEmbeddedWallet: null,
        });

        const { coreSigNonce, address } = selectWalletMetadata() || {};

        if (!address || !coreSigNonce || !signer) {
          const error = new Error("Invalid wallet metadata!");
          set({
            isGrantTradePermissionLoadingForEmbeddedWallet: false,
            grantPermissionErrorForEmbeddedWallet: error,
          });
          return rejectThunkWithError(error);
        }
        const params = {
          accountId: accountId || useUserStore?.getState()?.user?.id,
          owner: { coreSigNonce },
          permissionTarget: useUserStore?.getState()?.user?.account?.address,
          signer,
        } as GrantTradePermissionParams;
        console.log("grantTradePermissionToEmbeddedWallet", params);

        const result = await grantConditionalOrdersPermissionService(params);

        refreshWalletMetadata();
        set({
          isTradePermissionGrantedForEmbeddedWallet: true,
          isGrantTradePermissionLoadingForEmbeddedWallet: false,
          grantPermissionErrorForEmbeddedWallet: null,
        });

        return result;
      } catch (error: any) {
        if (error?.message === "ValueAlreadyInSet") {
          set({
            isTradePermissionGrantedForEmbeddedWallet: true,
            isGrantTradePermissionLoadingForEmbeddedWallet: false,
          });
          return;
        }
        set({
          isGrantTradePermissionLoadingForEmbeddedWallet: false,
          grantPermissionErrorForEmbeddedWallet: error,
        });
        return rejectThunkWithError(error);
      }
    },

    checkIsConditionalOrdersPermissionGranted: async (accountId) => {
      console.log("checkIsConditionalOrdersPermissionGranted", accountId);
      console.log(
        "useUserStore?.getState()?.user?.id",
        useUserStore?.getState()?.user?.id,
      );
      try {
        const { permissionGiven } =
          await checkIsConditionalOrdersPermissionGrantedService({
            accountId:
              accountId || (useUserStore?.getState()?.user?.id as number),
          });
        if (!useUserStore?.getState()?.ownerMetadata?.address) {
          return;
        }
        console.log(
          "checkIsConditionalOrdersPermissionGranted result",
          permissionGiven,
        );
        if (permissionGiven) {
          set({
            isTradePermissionGranted: true,
            isGrantTradePermissionLoading: false,
          });
        } else {
          set({
            isTradePermissionGranted: false,
            isGrantTradePermissionLoading: false,
          });
        }
        return permissionGiven;
      } catch (error) {
        console.error(
          "checkIsConditionalOrdersPermissionGranted error:",
          error,
        );
        set({
          isTradePermissionGranted: false,
          isGrantTradePermissionLoading: false,
        });
      }
    },

    checkIsConditionalOrdersPermissionGrantedToEmbeddedWallet: async (
      accountId,
    ) => {
      console.log(
        "checkIsConditionalOrdersPermissionGrantedToEmbeddedWallet",
        accountId,
      );
      console.log(
        "useUserStore?.getState()?.user?.id",
        useUserStore?.getState()?.user?.id,
      );
      try {
        const params = {
          accountId: accountId || useUserStore?.getState()?.user?.id,
          targetWalletAddress: useUserStore?.getState()?.user?.account?.address,
        } as AlreadyGaveTradePermissionToWalletParams;

        const { permissionGiven } =
          await checkIsConditionalOrdersPermissionGrantedToEmbeddedWalletService(
            params,
          );
        console.log(
          "checkIsConditionalOrdersPermissionGrantedToEmbeddedWallet result",
          permissionGiven,
        );
        if (!useUserStore?.getState()?.user?.account?.address) {
          return;
        }
        if (permissionGiven) {
          set({
            isTradePermissionGrantedForEmbeddedWallet: true,
            isGrantTradePermissionLoadingForEmbeddedWallet: false,
          });
        } else {
          set({
            isTradePermissionGrantedForEmbeddedWallet: false,
            isGrantTradePermissionLoadingForEmbeddedWallet: false,
          });
        }
        return permissionGiven;
      } catch (error) {
        console.error(
          "checkIsConditionalOrdersPermissionGrantedToEmbeddedWallet error:",
          error,
        );
        set({
          isTradePermissionGrantedForEmbeddedWallet: false,
          isGrantTradePermissionLoadingForEmbeddedWallet: false,
        });
        return false;
      }
    },

    // Новые методы revokeTradePermission
    revokeTradePermission: async ({ signer, accountId }) => {
      console.log("revokeTradePermission", accountId);
      try {
        if (!useUserStore?.getState()?.user?.id) {
          const error = new Error("Invalid accountId!");
          set({
            isRevokeTradePermissionLoading: false,
            revokePermissionError: error,
          });
          return rejectThunkWithError(error);
        }

        set({
          isRevokeTradePermissionLoading: true,
          revokePermissionError: null,
        });

        const { coreSigNonce, address } = selectWalletMetadata() || {};

        if (!address || !coreSigNonce || !signer) {
          const error = new Error("Invalid wallet metadata!");
          set({
            isRevokeTradePermissionLoading: false,
            revokePermissionError: error,
          });
          return rejectThunkWithError(error);
        }

        const params = {
          accountId: accountId || useUserStore?.getState()?.user?.id,
          owner: { coreSigNonce },
          permissionTarget: undefined,
          signer,
        } as RevokeTradePermissionParams;

        const result = await revokeTradePermissionService(params);
        refreshWalletMetadata();
        set({
          isTradePermissionGranted: false,
          isRevokeTradePermissionLoading: false,
          revokePermissionError: null,
        });

        return result;
      } catch (error: any) {
        set({
          isRevokeTradePermissionLoading: false,
          revokePermissionError: error,
        });
        return rejectThunkWithError(error);
      }
    },

    revokeTradePermissionToEmbeddedWallet: async ({ signer, accountId }) => {
      console.log("revokeTradePermissionToEmbeddedWallet", accountId);
      try {
        if (!useUserStore?.getState()?.user?.id) {
          const error = new Error("Invalid accountId!");
          set({
            isRevokeTradePermissionLoadingForEmbeddedWallet: false,
            revokePermissionErrorForEmbeddedWallet: error,
          });
          return rejectThunkWithError(error);
        }

        set({
          isRevokeTradePermissionLoadingForEmbeddedWallet: true,
          revokePermissionErrorForEmbeddedWallet: null,
        });

        const { coreSigNonce, address } = selectWalletMetadata() || {};

        if (!address || !coreSigNonce || !signer) {
          const error = new Error("Invalid wallet metadata!");
          set({
            isRevokeTradePermissionLoadingForEmbeddedWallet: false,
            revokePermissionErrorForEmbeddedWallet: error,
          });
          return rejectThunkWithError(error);
        }

        const params = {
          accountId: accountId || useUserStore?.getState()?.user?.id,
          owner: { coreSigNonce },
          permissionTarget: useUserStore?.getState()?.user?.account?.address,
          signer,
        } as RevokeTradePermissionParams;

        const result = await revokeTradePermissionService(params);
        refreshWalletMetadata();
        set({
          isTradePermissionGrantedForEmbeddedWallet: false,
          isRevokeTradePermissionLoadingForEmbeddedWallet: false,
          revokePermissionErrorForEmbeddedWallet: null,
        });

        return result;
      } catch (error: any) {
        set({
          isRevokeTradePermissionLoadingForEmbeddedWallet: false,
          revokePermissionErrorForEmbeddedWallet: error,
        });
        return rejectThunkWithError(error);
      }
    },
  })),
);
