"use client";

import { BrowserProvider, JsonRpcSigner } from "ethers";
import { useMemo } from "react";
import { type Account, Chain, Client, Transport } from "viem";
import { type Config, useConnectorClient } from "wagmi";

export function clientToSigner(client: Client<Transport, Chain, Account>) {
  const { account, chain, transport } = client;

  const network = {
    chainId: chain.id,
    ensAddress: chain.contracts?.ensRegistry?.address,
    name: chain.name,
  };

  const provider = new BrowserProvider(transport, network);
  return new JsonRpcSigner(provider, account.address);
}

export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: client } = useConnectorClient<Config>({ chainId });

  return useMemo(() => {
    if (client && client.chain) {
      return clientToSigner(client);
    } else {
      return null;
    }
  }, [client]);
}
