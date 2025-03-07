"use client";
import { useEffect } from "react";

import { armSimulateCrossMarginTradeService } from "@/services/trade-form/armSimulateCrossMarginTradeService";
import { armSimulateIsolatedTradeService } from "@/services/trade-form/armSimulateIsolatedTradeService";
import { useMarketStore } from "@/shared/store/useMarketStore";
import useUserStore from "@/shared/store/user.store";

export const useFormInitialization = () => {
  const { selectedMarket } = useMarketStore();
  const { user } = useUserStore();
  const runArmSimulateIsolatedTradeService = async () => {
    if (!user?.id || !selectedMarket?.id) return undefined;
    await armSimulateIsolatedTradeService({
      marginAccountId: user.id as number,
      marketId: selectedMarket.id as number,
    });
    await armSimulateCrossMarginTradeService({
      marginAccountId: user.id as number,
      marketId: selectedMarket.id as number,
    });
  };
  useEffect(() => {
    if (!user?.id || !selectedMarket?.id) return;
    runArmSimulateIsolatedTradeService();
  }, [user?.id, selectedMarket?.id]);
};
