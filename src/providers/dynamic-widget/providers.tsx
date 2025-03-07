"use client";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { mergeNetworks } from "@dynamic-labs/sdk-react-core";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { Account, Chain, http } from "viem";
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  sepolia,
} from "viem/chains";
import { createConfig, WagmiProvider } from "wagmi";

import { cssOverrides } from "@/providers/dynamic-widget/cssOverrides";
import { DynamicContextProvider } from "@/providers/dynamic-widget/dynamic";
import { rebuildAccount } from "@/shared/hooks/useUserSync";
import useUserStore from "@/shared/store/user.store";

import { customEvmNetworks } from "./customEvmNetworks";
import UserContext from "src/providers/UserContext";

const queryClient = new QueryClient();

const supportedChains = [
  mainnet,
  optimism,
  arbitrum,
  base,
  polygon,
  sepolia,
  arbitrumSepolia,
  optimismSepolia,
  baseSepolia,
] as readonly [Chain, ...Chain[]];

export const wagmi_config = createConfig({
  chains: supportedChains,
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [polygon.id]: http(),
    [sepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
    [optimismSepolia.id]: http(),
    [baseSepolia.id]: http(),
  },
});

function Providers({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = React.useState(false);
  const { updateUserInBackground } = useUserStore();
  const environmentId = process.env.NEXT_PUBLIC_ENVIRONMENT_ID || "";
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted ? (
    <DynamicContextProvider
      theme="dark"
      settings={{
        cssOverrides,
        environmentId,
        appName: "Zeuz",
        walletConnectors: [EthereumWalletConnectors],
        walletConnectPreferredChains: [
          "eip155:10", // Optimism
          "eip155:1", // Ethereum Mainnet
          "eip155:42161", // Arbitrum
          "eip155:137", // Polygon
          "eip155:8453", // Base Mainnet
          "eip155:11155111", // Sepolia
          "eip155:84531", // Base Sepolia
          "eip155:421613", // Arbitrum Sepolia
          "eip155:420", // Optimism Sepolia
        ],
        events: {
          onWalletAdded: (params) => {
            updateUserInBackground(
              rebuildAccount(params.wallet) as unknown as Account,
            );
          },
          onLogout: () => {
            window.location.reload();
          },
          onWalletRemoved: () => {
            window.location.reload();
          },
        },
        overrides: {
          evmNetworks: (networks) => mergeNetworks(customEvmNetworks, networks),
        },
      }}
    >
      <WagmiProvider config={wagmi_config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
            <UserContext>{children}</UserContext>
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  ) : null;
}

export default Providers;
