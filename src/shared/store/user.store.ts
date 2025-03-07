"use client";
import { MarginAccountEntity } from "@reyaxyz/common/dist/types";
import { produce } from "immer";
import { Account } from "viem";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { useTradePermissionStore } from "@/shared/components/TradePermission/useTradePermissionStore";
import {
  getOrCreateMainAccount,
  getOwnerMetadata,
} from "@/shared/utils/reyaConnector";

let onceAccount: number | null = null;

export type UserExtended =
  | (MarginAccountEntity & {
      account: Account & {
        address: string;
        connector: any;
      };
      [key: string]: any;
    })
  | null;

interface UserStore {
  resentUpdateMs: number;
  user: UserExtended;
  accounts: UserExtended[];
  address: string | null;
  setUser: (user: UserExtended) => void;
  updateUser: (partialUser: Partial<UserExtended>) => void;
  getAddress: () => string | null;
  updateUserInBackground: (account: Account) => Promise<void>;
  ownerMetadata: any;
  refreshWalletMetadata: () => void;
  isOverview: boolean;
  toggleIsOverview: () => void;
}

const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isOverview: false,
      toggleIsOverview: () => {
        set(
          produce((state) => {
            state.isOverview = !state.isOverview;
          }),
        );
      },
      accounts: [],
      address: null,
      resentUpdateMs: 0,
      ownerMetadata: null,
      setUser: (user) => {
        set(
          produce((state) => {
            if (!user) {
              state.user = null;
              state.address = null;
              state.accounts = [];
              state.ownerMetadata = null;
              state.resentUpdateMs = 2000;
            } else {
              state.user = user;
              state.address = user?.account?.address ?? null;
            }
          }),
        );
        useTradePermissionStore
          .getState()
          .checkIsConditionalOrdersPermissionGranted();
        useTradePermissionStore
          .getState()
          .checkIsConditionalOrdersPermissionGrantedToEmbeddedWallet();
      },

      updateUser: (partialUser) =>
        set(
          produce((state) => {
            const resentedUpdateMs = state.resentUpdateMs;
            if (resentedUpdateMs && Date.now() - resentedUpdateMs < 1000) {
              return;
            }
            if (state.user) {
              Object.assign(state.user, partialUser);
              state.address = state.user.account?.address ?? null;
            }
            state.resentUpdateMs = Date.now();
          }),
        ),

      getAddress: () => get().user?.account?.address ?? null,

      updateUserInBackground: async (account) => {
        if (!account?.address) return;

        try {
          const currentUserId = get().user?.id;
          const resentUpdateMs = get().resentUpdateMs;
          if (resentUpdateMs && Date.now() - resentUpdateMs < 2000) {
            return;
          }
          set(
            produce((state) => {
              state.resentUpdateMs = Date.now();
            }),
          );

          const ownerMetadata = await getOwnerMetadata(
            account?.address as string,
          );
          const { accounts, updatedUser } = await getOrCreateMainAccount(
            account?.address,
            currentUserId,
          );
          const sortedAccounts = accounts.sort((a: any, b: any) => {
            if (
              a?.totalBalanceFormatted?.value > b?.totalBalanceFormatted?.value
            )
              return -1;
            if (
              a?.totalBalanceFormatted?.value < b?.totalBalanceFormatted?.value
            )
              return 1;
            if (a?.totalPositionsCount > b?.totalPositionsCount) return -1;
            if (a?.totalPositionsCount < b?.totalPositionsCount) return 1;
            if (a.name > b.name) return -1;
            if (a.name < b.name) return 1;
            return 0;
          });
          const finalAccounts = sortedAccounts.filter((a: any) => {
            // Неактивні ізольовані акаунти (з нульовим балансом і позиціями) не відображаються
            if (
              a?.totalBalanceFormatted?.value === "0" &&
              a?.totalPositionsCount === 0
            ) {
              if (a.id === updatedUser?.id) {
                return true;
              } else if (a.id === currentUserId) {
                return true;
              } else if (a.name !== "Isolated Trade Account") {
                return true;
              } else {
                return false;
              }
            }
            return true;
          });
          if (updatedUser?.id !== onceAccount) {
            console.log("+++ USER +++", {
              user: {
                ...updatedUser,
                account,
              },
              ownerMetadata,
              accounts: finalAccounts,
            });
            onceAccount = updatedUser?.id;
          }
          set(
            produce((state) => {
              state.ownerMetadata = ownerMetadata;
              state.accounts = finalAccounts;
              state.resentUpdateMs = updatedUser ? Date.now() : 0;
              state.user = {
                ...updatedUser,
                account,
              };
              state.address = account.address;
            }),
          );
        } catch (error) {
          console.error("Background update failed", error);
        }
      },
      refreshWalletMetadata: async () => {
        const address = get().user?.account?.address;
        if (!address) {
          return;
        }
        const ownerMetadata = await getOwnerMetadata(address);
        console.log("ownerMetadata", ownerMetadata);
        set(
          produce((state) => {
            state.ownerMetadata = ownerMetadata;
          }),
        );
      },
    }),
    {
      name: "user-store", // Имя ключа в localStorage
      skipHydration: true,
    },
  ),
);

export const selectWalletMetadata = () => {
  const state = useUserStore.getState();
  return state.ownerMetadata;
};

export const refreshWalletMetadata = () => {
  const state = useUserStore.getState();
  state.refreshWalletMetadata();
};
export default useUserStore;
