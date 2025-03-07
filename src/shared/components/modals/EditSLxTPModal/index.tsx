"use client";
import { CancelConditionalOrderParams } from "@reyaxyz/api-sdk";
import React, { FC, useCallback, useEffect, useState } from "react";
import { useChainId } from "wagmi";

import { useNotifications } from "@/providers/notifications/useNotifications";
import {
  ConditionalOrderMap,
  RegisterConditionalOrderParams,
  UpdateConditionalOrderParams,
} from "@/services/conditional-orders/services";
import TradePermission from "@/shared/components/TradePermission";
import { useTradePermissionStore } from "@/shared/components/TradePermission/useTradePermissionStore";
import Block from "@/shared/components/ui/Block";
import { Button } from "@/shared/components/ui/Button/button";
import CustomInput from "@/shared/components/ui/Input";
import { useConditionalOrders } from "@/shared/hooks/useConditionalOrders";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useEthersSigner } from "@/shared/hooks/walletUtils";
import { useMarketStore } from "@/shared/store/useMarketStore";
import useUserStore from "@/shared/store/user.store";
import { priceFormatter } from "@/shared/utils/ui-minions";

import s from "./EditSLxTPModal.module.scss";
import { IEditSLxTPModalProps } from "./types";

interface IEditSLxTPModal {
  onSuccessful: () => void;
  data: IEditSLxTPModalProps;
}

const EditSLxTPModal: FC<IEditSLxTPModal> = ({ onSuccessful, data }) => {
  const { side, market, accountId: marginAccountId } = data;
  const {
    isTradePermissionGranted,
    isTradePermissionGrantedForEmbeddedWallet,
  } = useTradePermissionStore();
  const {
    registerConditionalOrder,
    updateConditionalOrder,
    cancelConditionalOrder,
  } = useConditionalOrders();
  const { user } = useUserStore();
  const { markets } = useMarketStore();
  const currentMarkPrice =
    // @ts-ignore
    +markets?.find((m) => m.id === data?.marketId)?.markPrice || 0;
  const currentChain = useChainId();
  const signer = useEthersSigner({ chainId: currentChain as number });
  const { addNotification } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({
    stopLoss: "",
    takeProfit: "",
  });
  const initialStopLossPrice =
    data?.conditionalOrdersInfo?.stopLoss?.price || "";
  const [stopLossPrice, setStopLossPrice] = useState<number | string>(
    data?.conditionalOrdersInfo?.stopLoss?.price || "",
  );
  const debouncedStopLoss = useDebounce(stopLossPrice, 300);

  const initialTakeProfitPrice =
    data?.conditionalOrdersInfo?.takeProfit?.price || "";
  const [takeProfitPrice, setTakeProfitPrice] = useState<number | string>(
    data?.conditionalOrdersInfo?.takeProfit?.price || "",
  );
  const debouncedTakeProfit = useDebounce(takeProfitPrice, 500);

  const [info, setInfo] = useState<{
    estimatedStopLossPnL: number | null;
    estimatedTakeProfitPnL: number | null;
  } | null>({
    estimatedStopLossPnL: null,
    estimatedTakeProfitPnL: null,
  });

  const handleStopLossChange = useCallback(
    (value: string) => {
      const numVal = +value;
      setStopLossPrice(value);

      setErrors((prev) => ({ ...prev, stopLoss: "" }));

      if (!value || numVal <= 0) {
        return;
      }

      if (isNaN(numVal)) {
        setErrors((prev) => ({ ...prev, stopLoss: "Invalid price" }));
        return;
      }

      const currentPrice = currentMarkPrice || 0;

      if (side === "long" && numVal >= currentPrice) {
        if (value !== "") {
          setErrors((prev) => ({
            ...prev,
            stopLoss: "SL must be lower than the current price.",
          }));
        }
      } else if (side === "short" && numVal <= currentPrice) {
        if (value !== "") {
          setErrors((prev) => ({
            ...prev,
            stopLoss: "SL must be higher than the current price.",
          }));
        }
      }
    },
    [currentMarkPrice, side],
  );

  const handleTakeProfitChange = useCallback(
    (value: string) => {
      const numVal = +value;
      setTakeProfitPrice(value);

      setErrors((prev) => ({ ...prev, takeProfit: "" }));

      if (!value || numVal <= 0) {
        return;
      }

      if (isNaN(numVal)) {
        setErrors((prev) => ({ ...prev, takeProfit: "Invalid price" }));
        return;
      }

      const currentPrice = currentMarkPrice || 0;

      if (side === "long" && numVal <= currentPrice) {
        if (value !== "") {
          setErrors((prev) => ({
            ...prev,
            takeProfit: "TP must be higher than the current price.",
          }));
        }
      } else if (side === "short" && numVal >= currentPrice) {
        if (value !== "") {
          setErrors((prev) => ({
            ...prev,
            takeProfit: "TP must be lower than the current price.",
          }));
        }
      }
    },
    [currentMarkPrice, side],
  );

  const isExistingPosition = false;
  const base = data?.base;
  const averageEntryPrice = data?.price;

  useEffect(() => {
    const canPnLBeCalculated =
      !isExistingPosition &&
      base !== null &&
      typeof base === "number" &&
      averageEntryPrice !== null &&
      typeof averageEntryPrice === "number";

    const slPnL =
      canPnLBeCalculated && debouncedStopLoss && +debouncedStopLoss > 0
        ? side === "short"
          ? Math.abs(base) * (averageEntryPrice - +debouncedStopLoss)
          : Math.abs(base) * (+debouncedStopLoss - averageEntryPrice)
        : null;

    const tpPnL =
      canPnLBeCalculated && debouncedTakeProfit && +debouncedTakeProfit > 0
        ? side === "short"
          ? Math.abs(base) * (averageEntryPrice - +debouncedTakeProfit)
          : Math.abs(base) * (+debouncedTakeProfit - averageEntryPrice)
        : null;

    setInfo((prev) => ({
      ...prev,
      stopLoss: +debouncedStopLoss > 0 ? +debouncedStopLoss : null,
      takeProfit: +debouncedTakeProfit > 0 ? +debouncedTakeProfit : null,
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

  const handleEdit = async () => {
    if (!user || !signer) return;
    if (errors.stopLoss || errors.takeProfit) {
      addNotification({
        title: "Validation error",
        type: "error",
        statusText: "Please fix input errors before confirming.",
      });
      return;
    }
    setIsEditing(true);

    try {
      if (stopLossPrice !== initialStopLossPrice) {
        console.log("stopLossPricestopLossPrice", stopLossPrice);

        const orderId = data?.conditionalOrdersInfo?.stopLoss?.orderId;

        if (stopLossPrice === null || stopLossPrice === "") {
          if (initialStopLossPrice !== null && orderId && marginAccountId) {
            const params = {
              orderId,
              signer,
            };
            console.log("cancelConditionalOrder params ", params);
            const result = await cancelConditionalOrder(
              params as unknown as CancelConditionalOrderParams,
            );
            console.log("cancelConditionalOrder result ", result);
          }
        } else if (
          initialStopLossPrice !== null &&
          marginAccountId &&
          market &&
          orderId
        ) {
          const params = {
            // @ts-ignore
            signer,
            marginAccountId,
            triggerPrice: stopLossPrice,
            orderType: ConditionalOrderMap.STOP_LOSS,
            marketId: market.id,
            supportingParams: {
              counterpartyAccountIds: market.orderInfo.counterpartyAccountIds,
              currentPrice: market.markPrice as number,
              exchangeId: 4,
            },
            amountInBase: base,
            cancelOrderId: orderId,
          };
          console.log("updateConditionalOrder params ", params);
          const result = await updateConditionalOrder(
            params as unknown as UpdateConditionalOrderParams,
          );
          console.log("updateConditionalOrder result ", result);
        } else {
          if (
            typeof marginAccountId !== "number" ||
            isNaN(marginAccountId) ||
            !market ||
            !side
          ) {
            return;
          }
          const params = {
            signer,
            marginAccountId,
            triggerPrice: stopLossPrice,
            orderType: ConditionalOrderMap.STOP_LOSS,
            marketId: market.id,
            supportingParams: {
              counterpartyAccountIds: market.orderInfo.counterpartyAccountIds,
              currentPrice: market.markPrice as number,
              exchangeId: 4,
            },
            amountInBase: base,
          };
          console.log("registerConditionalOrder params ", params);
          const result = await registerConditionalOrder(
            params as unknown as RegisterConditionalOrderParams,
          );
          console.log("registerConditionalOrder result ", result);
        }
      }

      if (takeProfitPrice !== initialTakeProfitPrice) {
        const orderId = data?.conditionalOrdersInfo?.takeProfit?.orderId;
        console.log("takeProfitPrice", takeProfitPrice);
        if (takeProfitPrice === null || takeProfitPrice === "") {
          if (initialTakeProfitPrice !== null && orderId && marginAccountId) {
            const params = {
              orderId,
              signer,
            };
            console.log("cancelConditionalOrder params ", params);
            const result = await cancelConditionalOrder(
              params as unknown as CancelConditionalOrderParams,
            );
            console.log("cancelConditionalOrder result ", result);
          }
        } else if (
          initialTakeProfitPrice !== null &&
          marginAccountId &&
          market &&
          orderId
        ) {
          const params = {
            // @ts-ignore
            signer,
            marginAccountId,
            triggerPrice: takeProfitPrice,
            orderType: ConditionalOrderMap.TAKE_PROFIT,
            marketId: market.id,
            supportingParams: {
              counterpartyAccountIds: market.orderInfo.counterpartyAccountIds,
              currentPrice: market.markPrice as number,
              exchangeId: 4,
            },
            amountInBase: base,
            cancelOrderId: orderId,
          };
          console.log("updateConditionalOrder params ", params);
          const result = await updateConditionalOrder(
            params as unknown as UpdateConditionalOrderParams,
          );
          console.log("updateConditionalOrder result ", result);
        } else {
          if (
            typeof marginAccountId !== "number" ||
            isNaN(marginAccountId) ||
            !market ||
            !side
          ) {
            return;
          }

          const params = {
            signer,
            marginAccountId,
            triggerPrice: takeProfitPrice,
            orderType: ConditionalOrderMap.TAKE_PROFIT,
            marketId: market.id,
            supportingParams: {
              counterpartyAccountIds: market.orderInfo.counterpartyAccountIds,
              currentPrice: market.markPrice as number,
              exchangeId: 4,
            },
            amountInBase: base,
          };
          console.log("registerConditionalOrder params ", params);
          const result = await registerConditionalOrder(
            params as unknown as RegisterConditionalOrderParams,
          );
          console.log("registerConditionalOrder result ", result);
        }
      }

      addNotification({
        title: "Stop Loss / Take Profit",
        type: "success",
        statusText: "",
      });
      onSuccessful();
    } catch (error) {
      console.log("stopLossPrice", stopLossPrice);
      console.log("takeProfitPrice", takeProfitPrice);
      console.error("close position error", error);
      addNotification({
        title:
          // @ts-ignore
          error?.message ||
          // @ts-ignore
          error?.response?.data?.message ||
          "Something went wrong",
        type: "error",
        statusText: "// Error",
      });
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <Block isLoading={isEditing} className={s.deposit} opacityLvl={5}>
      <div className={s.deposit__header}>
        <h2 className={s.deposit__title}>Stop Loss / Take Profit</h2>
        <p className={s.deposit__description}>Under {user?.name}</p>
      </div>

      <div className={s.network_select}>
        <div className={s.network_select__label}>Market Price</div>
        <div>
          <span className={s.network_select__value}>
            <span>{currentMarkPrice}</span>
            <span>rUSD</span>
          </span>
        </div>
      </div>

      <div className={s.amount_input}>
        <div className={s.stop_loss}>
          <div className={s.stop_loss__label}>
            <p>Stop Loss</p>
            {info?.estimatedStopLossPnL && !errors?.stopLoss ? (
              <span>
                Est. PnL:{" "}
                <span
                  style={{
                    color:
                      info?.estimatedStopLossPnL &&
                      info?.estimatedStopLossPnL > 0
                        ? "var(--green)"
                        : "var(--red)",
                  }}
                >
                  {info?.estimatedStopLossPnL
                    ? priceFormatter(info?.estimatedStopLossPnL)
                    : "--"}
                  rUSD
                </span>
              </span>
            ) : null}
          </div>
          <CustomInput
            isNumber
            value={stopLossPrice}
            error={errors.stopLoss}
            onChange={(e) => {
              handleStopLossChange(e.target.value);
            }}
            placeholder="Enter price"
            inputWrapperClassName={s.stop_loss__input}
          />
        </div>

        <div className={s.stop_loss}>
          <div className={s.stop_loss__label}>
            <p>Take Profit</p>
            {info?.estimatedTakeProfitPnL && !errors?.takeProfit ? (
              <span>
                Est. PnL:{" "}
                <span
                  style={{
                    color: info?.estimatedTakeProfitPnL
                      ? info.estimatedTakeProfitPnL > 0
                        ? "var(--green)"
                        : "var(--red)"
                      : "inherit",
                  }}
                >
                  {info.estimatedTakeProfitPnL
                    ? priceFormatter(info.estimatedTakeProfitPnL)
                    : "--"}{" "}
                  rUSD
                </span>
              </span>
            ) : null}
          </div>
          <CustomInput
            isNumber
            value={takeProfitPrice}
            error={errors.takeProfit}
            onChange={(e) => {
              handleTakeProfitChange(e.target.value);
            }}
            placeholder="Enter price"
            inputWrapperClassName={s.stop_loss__input}
          />
        </div>

        {/*Info*/}
        <div className={s.amount_input__available}>
          <p>Position</p>
          <div>
            <span className={s.amount_input__available__value}>
              {data?.base}
            </span>{" "}
            {data?.market?.quoteToken}
          </div>
        </div>
        <div className={s.amount_input__available}>
          <p>Applies to</p>
          <div>
            <span className={s.amount_input__available__value}>
              Entire Position
            </span>
          </div>
        </div>
        <div className={s.amount_input__available}>
          <p>Entry Price</p>
          <div>
            <span className={s.amount_input__available__value}>
              {data?.priceFormatted}
            </span>
            &nbsp;rUSD
          </div>
        </div>
      </div>
      {isTradePermissionGranted && isTradePermissionGrantedForEmbeddedWallet ? (
        <Button
          onClick={handleEdit}
          variant="primary"
          className={s.action_button}
          disabled={
            isEditing ||
            !!errors.stopLoss ||
            !!errors.takeProfit ||
            !signer ||
            !user ||
            (initialStopLossPrice === stopLossPrice &&
              initialTakeProfitPrice === takeProfitPrice)
          }
        >
          {isEditing ? "Processing..." : "Confirm"}
        </Button>
      ) : (
        <div>
          {!isTradePermissionGranted ? <TradePermission /> : null}
          {!isTradePermissionGrantedForEmbeddedWallet ? (
            <TradePermission onlyWalletPermission />
          ) : null}
        </div>
      )}
    </Block>
  );
};

export default EditSLxTPModal;
