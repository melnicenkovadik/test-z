import { ConditionalOrderType } from "@reyaxyz/api-sdk";
import { useState, useCallback, useEffect } from "react";

import {
  ConditionalOrderMap,
  registerConditionalOrderService,
} from "@/services/conditional-orders/services";
import { useDebounce } from "@/shared/hooks/useDebounce";

interface ConditionalOrderError {
  stopLoss?: string;
  takeProfit?: string;
}

interface ConditionalOrderInfo {
  stopLoss: number | null;
  takeProfit: number | null;
  estimatedStopLossPnL: number | null;
  estimatedTakeProfitPnL: number | null;
}

interface UseConditionalOrderParamsResult {
  stopLoss: number | "";
  takeProfit: number | "";
  errors: ConditionalOrderError;
  info: ConditionalOrderInfo;
  setStopLoss: (value: number | "") => void;
  setTakeProfit: (value: number | "") => void;
  createStopLossOrder: () => Promise<void>;
  createTakeProfitOrder: () => Promise<void>;
  enableSLandTP: boolean;
  toggleEnableSLandTP: () => void;
}

export interface ConditionalOrderMarket {
  id: number;
  markPrice?: number;
  orderInfo: {
    counterpartyAccountIds: number[];
  };
}

interface UseConditionalOrderParams {
  marginAccountId: number;
  market: ConditionalOrderMarket;
  signer: any;
  side: "short" | "long";
  averageEntryPrice: number | null;
  base: number | null;
  isExistingPosition: boolean;
}

export const useConditionalOrderParams = ({
  marginAccountId,
  market,
  signer,
  side,
  averageEntryPrice,
  base,
  isExistingPosition,
}: UseConditionalOrderParams): UseConditionalOrderParamsResult => {
  const [stopLoss, setStopLoss] = useState<number | "">("");
  const [takeProfit, setTakeProfit] = useState<number | "">("");
  const [errors, setErrors] = useState<ConditionalOrderError>({});

  const [info, setInfo] = useState<ConditionalOrderInfo>({
    stopLoss: null,
    takeProfit: null,
    estimatedStopLossPnL: null,
    estimatedTakeProfitPnL: null,
  });

  const [enableSLandTP, setEnableSLandTP] = useState<boolean>(false);

  const debouncedStopLoss = useDebounce(stopLoss, 500);
  const debouncedTakeProfit = useDebounce(takeProfit, 500);

  const toggleEnableSLandTP = useCallback(() => {
    setEnableSLandTP((prev) => !prev);
  }, []);

  const handleStopLossChange = useCallback(
    (value: number | "") => {
      setStopLoss(value);
      setErrors((prev) => ({ ...prev, stopLoss: "" }));
      if (value === "") {
        setErrors((prev) => ({ ...prev, stopLoss: "" }));
        return;
      }

      if (typeof value !== "number" || isNaN(value)) {
        setErrors((prev) => ({ ...prev, stopLoss: "Invalid price" }));
        return;
      }

      if (!market?.markPrice || typeof market.markPrice !== "number") {
        setErrors((prev) => ({ ...prev, stopLoss: "Pool price not found" }));
        return;
      }
      const currentPrice = market.markPrice;
      if (side === "long" && value >= currentPrice) {
        setErrors((prev) => ({
          ...prev,
          stopLoss: "SL must be lower than the current market price",
        }));
        return;
      }
      if (side === "short" && value <= currentPrice) {
        setErrors((prev) => ({
          ...prev,
          stopLoss: "SL must be higher than the current market price",
        }));
        return;
      }
    },
    [market, side],
  );

  const handleTakeProfitChange = useCallback(
    (value: number | "") => {
      if (value === "") {
        setTakeProfit(value);
        setErrors((prev) => ({ ...prev, takeProfit: "" }));
        return;
      }
      setTakeProfit(value);

      setErrors((prev) => ({ ...prev, takeProfit: "" }));
      if (typeof value !== "number" || isNaN(value)) {
        setErrors((prev) => ({ ...prev, takeProfit: "Invalid price" }));
        return;
      }

      if (!market?.markPrice || typeof market.markPrice !== "number") {
        setErrors((prev) => ({ ...prev, takeProfit: "Pool price not found" }));
        return;
      }

      const currentPrice = market.markPrice;
      if (side === "long" && value <= currentPrice) {
        setErrors((prev) => ({
          ...prev,
          takeProfit: "TP must be higher than the current market price",
        }));
        return;
      }
      if (side === "short" && value >= currentPrice) {
        setErrors((prev) => ({
          ...prev,
          takeProfit: "TP must be lower than the current market price",
        }));
        return;
      }
    },
    [market, side],
  );

  useEffect(() => {
    const canPnLBeCalculated =
      !isExistingPosition &&
      base !== null &&
      typeof base === "number" &&
      averageEntryPrice !== null &&
      typeof averageEntryPrice === "number";

    const slPnL =
      canPnLBeCalculated &&
      debouncedStopLoss !== "" &&
      typeof debouncedStopLoss === "number" &&
      debouncedStopLoss > 0
        ? side === "short"
          ? Math.abs(base) * (averageEntryPrice - debouncedStopLoss)
          : Math.abs(base) * (debouncedStopLoss - averageEntryPrice)
        : null;

    const tpPnL =
      canPnLBeCalculated &&
      debouncedTakeProfit !== "" &&
      typeof debouncedTakeProfit === "number" &&
      debouncedTakeProfit > 0
        ? side === "short"
          ? Math.abs(base) * (averageEntryPrice - debouncedTakeProfit)
          : Math.abs(base) * (debouncedTakeProfit - averageEntryPrice)
        : null;

    setInfo((prev) => ({
      ...prev,
      stopLoss:
        typeof debouncedStopLoss === "number" && debouncedStopLoss > 0
          ? debouncedStopLoss
          : null,
      takeProfit:
        typeof debouncedTakeProfit === "number" && debouncedTakeProfit > 0
          ? debouncedTakeProfit
          : null,
      estimatedStopLossPnL: slPnL,
      estimatedTakeProfitPnL: tpPnL,
    }));
  }, [
    debouncedStopLoss,
    debouncedTakeProfit,
    side,
    averageEntryPrice,
    base,
    isExistingPosition,
  ]);

  const createStopLossOrder = useCallback(async () => {
    try {
      if (errors.stopLoss) return;
      if (
        debouncedStopLoss === "" ||
        typeof debouncedStopLoss !== "number" ||
        debouncedStopLoss <= 0
      ) {
        return;
      }

      const params = {
        signer,
        marginAccountId,
        triggerPrice: +debouncedStopLoss,
        orderType: ConditionalOrderMap.STOP_LOSS,
        marketId: market.id,
        supportingParams: {
          counterpartyAccountIds: market.orderInfo.counterpartyAccountIds,
          currentPrice: market.markPrice as number,
          exchangeId: 4,
        },
        amountInBase: base,
      };
      console.log("createStopLossOrder STOP_LOSS result", params);
      // @ts-ignore
      const result = await registerConditionalOrderService(params);
      console.log(
        "createStopLossOrder result",
        ConditionalOrderMap.STOP_LOSS,
        result,
      );
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        stopLoss: error?.message || "Something went wrong",
      }));
    }
  }, [debouncedStopLoss, errors.stopLoss, marginAccountId, market, signer]);

  const createTakeProfitOrder = useCallback(async () => {
    try {
      if (errors.takeProfit) return;
      if (
        debouncedTakeProfit === "" ||
        typeof debouncedTakeProfit !== "number" ||
        debouncedTakeProfit <= 0
      ) {
        return;
      }

      const params = {
        signer,
        marginAccountId,
        triggerPrice: +debouncedTakeProfit,
        orderType: ConditionalOrderMap.TAKE_PROFIT,
        marketId: market.id,
        supportingParams: {
          counterpartyAccountIds: market.orderInfo.counterpartyAccountIds,
          currentPrice: market.markPrice as number,
          exchangeId: 4,
        },
        amountInBase: base,
      };

      console.log("createTakeProfitOrder TAKE_PROFIT result", params);
      // @ts-ignore
      const result = await registerConditionalOrderService(params);
      console.log(
        "createTakeProfitOrder result",
        ConditionalOrderType.TAKE_PROFIT,
        result,
      );
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        takeProfit: error?.message || "Something went wrong",
      }));
    }
  }, [debouncedTakeProfit, errors.takeProfit, marginAccountId, market, signer]);

  return {
    stopLoss,
    takeProfit,
    errors,
    info,
    setStopLoss: handleStopLossChange,
    setTakeProfit: handleTakeProfitChange,
    createStopLossOrder,
    createTakeProfitOrder,
    enableSLandTP,
    toggleEnableSLandTP,
  };
};
