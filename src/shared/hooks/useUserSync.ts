"use client";
import { useEffect } from "react";
import { Account } from "viem";
import { useAccount } from "wagmi";

import useUserStore from "@/shared/store/user.store";

const isSyncing = false;
const useUserSync = (intervalMs: number = 15000) => {
  const account = useAccount();
  const { updateUserInBackground } = useUserStore();

  useEffect(() => {
    const address = account?.address;
    if (!address || !account || isSyncing) {
      return;
    }

    updateUserInBackground(rebuildAccount(account) as unknown as Account);
    const interval = setInterval(() => {
      updateUserInBackground(rebuildAccount(account) as unknown as Account);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [account, intervalMs]);
};

export const rebuildAccount = (data: any) => {
  if (!data) return null;
  return {
    status: data?.status,
    address: data?.address,
    addresses: data?.addresses,
    chainId: data?.chainId,
    chain: {
      blockExplorers: {
        default: {
          apiUrl: data?.chain?.blockExplorers?.default?.apiUrl,
          name: data?.chain?.blockExplorers?.default?.name,
          url: data?.chain?.blockExplorers?.default?.url,
        },
      },
      id: data?.chain?.id,
      name: data?.chain?.name,
      nativeCurrency: data?.chain?.nativeCurrency,
      rpc: data?.chain?.rpc,
      explorer: data?.chain?.explorer,
      fees: data?.chain?.fees,
    },
    connector: {
      id: data?.connector?.id,
      name: data?.connector?.name,
      type: data?.connector?.type,
    },
  };
};

export default useUserSync;
