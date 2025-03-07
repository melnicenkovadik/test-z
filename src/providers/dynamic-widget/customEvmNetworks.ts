"use client";
import { NetworkConfiguration } from "@dynamic-labs/sdk-api-core";
import { mainnet, optimism, arbitrum, polygon, base } from "viem/chains";

const toNetworkConfiguration = (
  chain: any,
  iconUrl: string,
): NetworkConfiguration => ({
  chain: chain.name,
  chainId: chain.id.toString(),
  name: chain.name,
  shortName: chain.name.toLowerCase(),
  networkId: chain.id.toString(),
  iconUrls: [iconUrl],
  nativeCurrency: {
    name: chain.nativeCurrency.name,
    symbol: chain.nativeCurrency.symbol,
    decimals: chain.nativeCurrency.decimals,
  },
  rpcUrls: chain.rpcUrls.default.http,
  blockExplorerUrls: [chain.blockExplorers?.default.url || ""],
  vanityName: chain.name,
});

export const customEvmNetworks: NetworkConfiguration[] = [
  toNetworkConfiguration(
    mainnet,
    "https://app.dynamic.xyz/assets/networks/eth.svg",
  ),
  toNetworkConfiguration(
    optimism,
    "https://app.dynamic.xyz/assets/networks/optimism.svg",
  ),
  toNetworkConfiguration(
    arbitrum,
    "https://app.dynamic.xyz/assets/networks/arbitrum.svg",
  ),
  toNetworkConfiguration(
    polygon,
    "https://app.dynamic.xyz/assets/networks/polygon.svg",
  ),
  toNetworkConfiguration(
    base,
    "https://app.dynamic.xyz/assets/networks/base.svg",
  ),
  {
    chain: "Reya Cronos",
    chainId: "89346162",
    name: "Reya Cronos",
    shortName: "reya-cronos",
    networkId: "89346162",
    iconUrls: ["https://yourcdn.com/icons/reya-cronos.svg"], // Добавьте свою иконку
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://rpc.reya-cronos.gelato.digital"],
    blockExplorerUrls: ["https://reya-cronos.blockscout.com"],
    vanityName: "Reya Cronos",
  },
  {
    chain: "Reya Network",
    chainId: "1729",
    name: "Reya Network",
    shortName: "reya-network",
    networkId: "1729",
    iconUrls: ["https://yourcdn.com/icons/reya-network.svg"], // Добавьте свою иконку
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://rpc.reya.network"],
    blockExplorerUrls: ["https://explorer.reya.network"],
    vanityName: "Reya Network",
  },
];
