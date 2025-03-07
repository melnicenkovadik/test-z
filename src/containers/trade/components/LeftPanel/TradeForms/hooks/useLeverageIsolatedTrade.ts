import { useEffect, useMemo, useState } from "react";

import { DIRECTION_TYPE } from "@/containers/trade/components/LeftPanel/trade-panel.types";
import { useNotifications } from "@/providers/notifications/useNotifications";
import { armSimulateIsolatedTradeService } from "@/services/trade-form/armSimulateIsolatedTradeService";
import { getMaxOrderSizeAvailableService } from "@/services/trade-form/cross-margin-trade-form/getMaxOrderSizeAvailableService";
import { updateCustomLeverageService } from "@/services/trade-form/updateCustomLeverageService";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useMarketStore } from "@/shared/store/useMarketStore";
import useUserStore from "@/shared/store/user.store";

type UseLeverageIsolatedTradeParams = {
  direction: DIRECTION_TYPE;
};
let onceSetted = false;

export const useLeverageIsolatedTrade = ({
  direction,
}: UseLeverageIsolatedTradeParams) => {
  const { addNotification } = useNotifications();
  const { selectedMarket } = useMarketStore();
  const { user } = useUserStore();

  const [amount, setAmount] = useState<string>("");
  const [maxAvailableOrderSize, setMaxAvailableOrderSize] = useState<{
    maxAmountBase: number;
    maxAmountSize: number;
    minAmountBase?: number;
    minAmountSize?: number;
  } | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { minBound, maxBound } = useMemo(() => {
    return {
      minBound: 1,
      maxBound: selectedMarket?.maxLeverage || 1,
    };
  }, [selectedMarket?.maxLeverage]);

  const [sliderValue, setSliderValue] = useState<number>(1);
  const [realLeverage, setRealLeverage] = useState<number>(1);
  const debouncedAmount = useDebounce(amount, 500);
  const debouncedSliderValue = useDebounce(sliderValue, 500);

  useEffect(() => {
    (async () => {
      if (!user?.id || !selectedMarket?.id || onceSetted) return;
      onceSetted = true;
      const updatedLeverage = await updateCustomLeverageService({
        accountId: user.id,
        marketId: selectedMarket.id,
        leverage: debouncedSliderValue,
      });

      await armSimulateIsolatedTradeService({
        marginAccountId: user.id,
        marketId: selectedMarket.id,
      });

      await getAvailableOrderSize();

      setRealLeverage(updatedLeverage.leverage);
      setSliderValue(updatedLeverage.leverage);
      console.log("updatedLeverage", updatedLeverage);
    })();
  }, [user?.id, amount, selectedMarket?.maxLeverage]);

  const getAvailableOrderSize = async () => {
    if (!user?.id || !selectedMarket?.id) return;

    try {
      const maxOrderSize = await getMaxOrderSizeAvailableService({
        direction,
        marginAccountId: user.id,
        marketId: selectedMarket.id,
      });
      if (!maxOrderSize) return;

      setMaxAvailableOrderSize(maxOrderSize);

      // if (
      //   maxOrderSize?.maxAmountSize &&
      //   debouncedAmount &&
      //   Number(debouncedAmount) > Number(maxOrderSize.maxAmountSize)
      // ) {
      //   setAmount(String(maxOrderSize.maxAmountSize));
      // }
    } catch (err) {
      console.error("Error fetching max order size:", err);
      addNotification({
        title: "Error fetching max order size",
        type: "error",
        statusText: "// Error",
      });
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchLeverageData = async () => {
      if (!selectedMarket || !user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      try {
        if (maxBound <= minBound) {
          setRealLeverage(minBound);
          return;
        }

        const updatedLeverage = await updateCustomLeverageService({
          accountId: user.id,
          marketId: selectedMarket.id,
          leverage: debouncedSliderValue,
        });

        await armSimulateIsolatedTradeService({
          marginAccountId: user.id,
          marketId: selectedMarket.id,
        });

        await getAvailableOrderSize();

        setRealLeverage(updatedLeverage.leverage);
      } catch (err: any) {
        console.error("Failed to fetch isolated leverage bounds:", err);
        setError(err?.message || "Failed to fetch leverage bounds");
      } finally {
        setLoading(false);
      }
    };

    void fetchLeverageData();
    return () => controller.abort();
  }, [
    direction,
    debouncedSliderValue,
    debouncedAmount,
    selectedMarket,
    user,
    setSliderValue,
    sliderValue,
    minBound,
    maxBound,
  ]);

  return {
    loading,
    error,
    sliderValue,
    setSliderValue,
    realLeverage,
    minBound,
    maxBound,
    amount,
    setAmount,
    maxAvailableOrderSize,
    debouncedAmount,
  };
};
