import { useEffect, useMemo, useState } from "react";

import { DIRECTION_TYPE } from "@/containers/trade/components/LeftPanel/trade-panel.types";
import { useNotifications } from "@/providers/notifications/useNotifications";
import { armSimulateCrossMarginTradeService } from "@/services/trade-form/armSimulateCrossMarginTradeService";
import { armSimulateIsolatedTradeService } from "@/services/trade-form/armSimulateIsolatedTradeService";
import { getLimitOrderSizeAvailableService } from "@/services/trade-form/cross-margin-trade-form/getLimitOrderMaxOrderSizeAvailableService";
import { getMaxOrderSizeAvailableService } from "@/services/trade-form/cross-margin-trade-form/getMaxOrderSizeAvailableService";
import { simulateCrossMarginLimitTradeService } from "@/services/trade-form/simulateCrossMarginLimitOderTradeService";
import { updateCustomLeverageService } from "@/services/trade-form/updateCustomLeverageService";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useMarketStore } from "@/shared/store/useMarketStore";
import useUserStore from "@/shared/store/user.store";

import { useCrossMarginTradeMaxOrderSizeAvailablePolling } from "./useCrossMarginTradeMaxOrderSizeAvailablePolling";

type UseLeverageSliderParams = {
  direction: DIRECTION_TYPE;
  isIsolatedTrade?: boolean;
  isCrossLimitTrade?: boolean;
  defaultLimitPrice?: string;
};

let prevSliderValue = 1;

export const useLeverageCrossSlider = ({
  direction,
  isIsolatedTrade = false,
  isCrossLimitTrade = false,
  defaultLimitPrice = "",
}: UseLeverageSliderParams) => {
  const { addNotification } = useNotifications();
  const { selectedMarket } = useMarketStore();
  const { user } = useUserStore();
  const [limitPrice, setLimitPrice] = useState<string>(defaultLimitPrice);
  const isLimitTrade = isCrossLimitTrade;

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
  const [sliderValue, setSliderValue] = useState<number>(
    selectedMarket?.maxLeverage || 0,
  );
  const [realLeverage, setRealLeverage] = useState<number>(
    selectedMarket?.maxLeverage || 0,
  );

  const debouncedAmount = useDebounce(amount, 500);
  const debouncedLimitPrice = useDebounce(limitPrice, 500);
  const debouncedSliderValue = useDebounce(sliderValue, 500);

  const getAvailableOrderSize = async () => {
    if (!user?.id || !selectedMarket?.id) {
      return;
    }
    try {
      let maxOrderSize: any = maxAvailableOrderSize || null;
      if (!isLimitTrade) {
        maxOrderSize = await getMaxOrderSizeAvailableService({
          direction,
          marginAccountId: user.id,
          marketId: selectedMarket.id,
        });
      } else {
        maxOrderSize = await getLimitOrderSizeAvailableService({
          triggerPrice: parseFloat(String(debouncedLimitPrice)),
        });
      }
      if (!maxOrderSize) {
        return;
      }
      setMaxAvailableOrderSize(maxOrderSize);

      if (
        maxOrderSize?.maxAmountSize &&
        debouncedAmount &&
        Number(debouncedAmount) > Number(maxOrderSize.maxAmountSize)
      ) {
        setAmount(String(maxOrderSize.maxAmountSize));
      }
    } catch (error) {
      console.error("Error fetching max order size:", error);
      addNotification({
        title: "Error fetching max order size",
        type: "error",
        statusText: "// Error",
      });
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchLeverageBounds = async () => {
      if (prevSliderValue !== sliderValue) {
        prevSliderValue = debouncedSliderValue;
        setLoading(true);
      }
      setError(null);

      if (!selectedMarket || !user) {
        setLoading(false);
        return;
      }
      try {
        if (maxBound <= minBound) {
          return minBound;
        }
        const [updateCustomLeverage] = await Promise.all([
          updateCustomLeverageService({
            accountId: user.id,
            marketId: selectedMarket.id,
            leverage: sliderValue,
          }),
          isIsolatedTrade
            ? armSimulateIsolatedTradeService({
                marginAccountId: user.id as number,
                marketId: selectedMarket.id as number,
              })
            : !isLimitTrade
              ? armSimulateCrossMarginTradeService({
                  marginAccountId: user.id,
                  marketId: selectedMarket.id,
                })
              : simulateCrossMarginLimitTradeService({
                  triggerPrice: parseFloat(
                    debouncedLimitPrice ? debouncedLimitPrice?.toString() : "0",
                  ),
                  amount: +debouncedAmount,
                  fromBase: false,
                }),
        ]);

        await getAvailableOrderSize();
        setRealLeverage(updateCustomLeverage.leverage);
      } catch (err: any) {
        setError(err?.message || "Failed to fetch leverage bounds");
      } finally {
        setLoading(false);
      }
    };

    void fetchLeverageBounds();
    return () => controller.abort();
  }, [
    direction,
    debouncedSliderValue,
    debouncedAmount,
    debouncedLimitPrice,
    selectedMarket?.markPrice,
    user?.id,
    isIsolatedTrade,
    isLimitTrade,
    maxBound,
    minBound,
    addNotification,
  ]);

  useCrossMarginTradeMaxOrderSizeAvailablePolling({
    direction,
    marginAccountId: user?.id,
    marketId: selectedMarket?.id,
    pollingInterval: 15000,
    setMaxAvailableOrderSize,
  });

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
    setMaxAvailableOrderSize,
    debouncedAmount,
    limitPrice,
    debouncedLimitPrice,
    setLimitPrice,
  };
};
