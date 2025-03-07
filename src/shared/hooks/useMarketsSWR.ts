"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getMarketsService } from "@/services/markets/getMarketsService";
import { MarketUI } from "@/services/markets/types";
import { useMarketStore } from "@/shared/store/useMarketStore";
import { mapMarketEntityToMarketUI } from "@/shared/utils/_common";
import { notEmpty } from "@/shared/utils/ui-minions";

async function fetchMarkets(): Promise<MarketUI[]> {
  const rawData = await getMarketsService();
  return rawData.map(mapMarketEntityToMarketUI).filter(notEmpty);
}
export function useMarketsQuery() {
  const { setMarkets } = useMarketStore();

  const { data, error, isLoading, isSuccess, isError, refetch } = useQuery({
    queryKey: ["markets"],
    queryFn: fetchMarkets,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (isSuccess && data) {
      setMarkets(data);
    }
  }, [data]);

  return {
    data,
    error,
    isLoading,
    isSuccess,
    isError,
    refetch,
  };
}
