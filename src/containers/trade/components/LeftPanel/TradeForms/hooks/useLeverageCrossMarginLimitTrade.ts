import { useEffect, useMemo, useState } from "react";

import { DIRECTION_TYPE } from "@/containers/trade/components/LeftPanel/trade-panel.types";
import { useNotifications } from "@/providers/notifications/useNotifications";
import { getLimitOrderSizeAvailableService } from "@/services/trade-form/cross-margin-trade-form/getLimitOrderMaxOrderSizeAvailableService";
import { simulateCrossMarginLimitTradeService } from "@/services/trade-form/simulateCrossMarginLimitOderTradeService";
import { updateCustomLeverageService } from "@/services/trade-form/updateCustomLeverageService";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useMarketStore } from "@/shared/store/useMarketStore";
import useUserStore from "@/shared/store/user.store";

import { useCrossMarginTradeMaxOrderSizeAvailablePolling } from "./useCrossMarginTradeMaxOrderSizeAvailablePolling";

type UseLeverageCrossMarginLimitTradeParams = {
  direction: DIRECTION_TYPE;
  defaultLimitPrice?: string; // Якщо потрібно встановити початкову ціну
};

export const useLeverageCrossMarginLimitTrade = ({
  direction,
  defaultLimitPrice = "",
}: UseLeverageCrossMarginLimitTradeParams) => {
  const { addNotification } = useNotifications();
  const { selectedMarket } = useMarketStore();
  const { user } = useUserStore();

  const [amount, setAmount] = useState<string>("");
  const [limitPrice, setLimitPrice] = useState<string>(defaultLimitPrice);
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

  const [sliderValue, setSliderValue] = useState<number>(
    selectedMarket?.maxLeverage || 1,
  );
  const [realLeverage, setRealLeverage] = useState<number>(
    selectedMarket?.maxLeverage || 1,
  );

  const debouncedAmount = useDebounce(amount, 500);
  const debouncedLimitPrice = useDebounce(limitPrice, 500);
  const debouncedSliderValue = useDebounce(sliderValue, 500);

  const getAvailableOrderSize = async () => {
    if (!user?.id || !selectedMarket?.id) return;

    try {
      const maxOrderSize = await getLimitOrderSizeAvailableService({
        triggerPrice: parseFloat(String(debouncedLimitPrice || "0")),
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
      console.error("Error fetching limit order size:", err);
      addNotification({
        title: "Error fetching limit order size",
        type: "error",
        statusText: "// Error",
      });
    }
  };

  useCrossMarginTradeMaxOrderSizeAvailablePolling({
    direction,
    limitPrice: debouncedLimitPrice,
    isLimitOrder: true,
    marginAccountId: user?.id,
    marketId: selectedMarket?.id,
    pollingInterval: 5000,
    setMaxAvailableOrderSize,
  });

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
        await simulateCrossMarginLimitTradeService({
          triggerPrice: parseFloat(String(debouncedLimitPrice || "0")),
          amount: Number(debouncedAmount || 0),
          fromBase: false,
        });

        await getAvailableOrderSize();

        setRealLeverage(updatedLeverage.leverage);
      } catch (err: any) {
        console.error("Failed to fetch limit leverage bounds:", err);
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
    debouncedLimitPrice,
    selectedMarket,
    user,
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
    limitPrice,
    setLimitPrice,
    debouncedLimitPrice,
  };
};
