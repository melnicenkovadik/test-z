"use client";
import { useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import clsx from "clsx";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useChainId } from "wagmi";

import { getCurrentMarketPrice } from "@/containers/trade/components/InfoData";
import { useDirectionStore } from "@/containers/trade/components/LeftPanel/DirectionPicker/direction.store";
import { DIRECTION_TYPE } from "@/containers/trade/components/LeftPanel/trade-panel.types";
import {
  ConditionalOrderMarket,
  useConditionalOrderParams,
} from "@/containers/trade/components/LeftPanel/TradeForms/hooks/useConditionalOrderParams";
import { useLeverageIsolatedTrade } from "@/containers/trade/components/LeftPanel/TradeForms/hooks/useLeverageIsolatedTrade";
import PercentageButtons from "@/containers/trade/components/LeftPanel/TradeForms/PercentageButtons";
import SlTpComponent from "@/containers/trade/components/LeftPanel/TradeForms/SlTpComponent";
import { useNotifications } from "@/providers/notifications/useNotifications";
import {
  ConditionalOrderMap,
  UpdateConditionalOrderParams,
} from "@/services/conditional-orders/services";
import {
  IsolatedTradeParams,
  isolatedTradeService,
} from "@/services/trade-form/isolatedTradeService";
import { simulateIsolatedTradeService } from "@/services/trade-form/simulateIsolatedTradeService";
import DepositModal from "@/shared/components/modals/DepositModal";
import TradePermission from "@/shared/components/TradePermission";
import { useTradePermissionStore } from "@/shared/components/TradePermission/useTradePermissionStore";
import Block from "@/shared/components/ui/Block";
import { Button } from "@/shared/components/ui/Button/button";
import CustomInput from "@/shared/components/ui/Input";
import Loader from "@/shared/components/ui/Loader/Loader";
import Modal from "@/shared/components/ui/Modal";
import RangeSlider from "@/shared/components/ui/Range";
import CustomSelect from "@/shared/components/ui/Select"; // NEW
import { useConditionalOrders } from "@/shared/hooks/useConditionalOrders";
import { useRequireAuthFlow } from "@/shared/hooks/useRequireAuthFlow";
import { rebuildAccount } from "@/shared/hooks/useUserSync";
import { useEthersSigner } from "@/shared/hooks/walletUtils";
import { useMarketStore } from "@/shared/store/useMarketStore";
import useUserStore, {
  refreshWalletMetadata,
  selectWalletMetadata,
} from "@/shared/store/user.store";
import { mapSimulateIsolatedTradeResultToSimulateIsolatedTradeUI } from "@/shared/utils/_common/mappers/mapSimulateIsolatedTradeResultToSimulateIsolatedTradeUI";
import { getOrCreateMainAccount } from "@/shared/utils/reyaConnector";

import s from "./trade-forms.module.scss";
import {
  getIcon,
  hasIcon,
} from "../../../../../../public/assets/icons/coins/avalible_icons";

let hashSimulation: null | number = null;

type SimulationResult = ReturnType<
  typeof mapSimulateIsolatedTradeResultToSimulateIsolatedTradeUI
>;

const IsolatedTradeForm: FC = () => {
  const [toggleShowSLTP, setToggleShowSLTP] = useState(false);
  const {
    isTradePermissionGranted,
    isTradePermissionGrantedForEmbeddedWallet,
    grantTradePermission,
    grantTradePermissionToEmbeddedWallet,
    checkIsConditionalOrdersPermissionGranted,
    checkIsConditionalOrdersPermissionGrantedToEmbeddedWallet,
  } = useTradePermissionStore();
  const { registerConditionalOrder } = useConditionalOrders();
  const isLoggedIn = useIsLoggedIn();
  const { requireAuth, ConnectModal } = useRequireAuthFlow({
    showCustomModal: false,
  });
  const account = useAccount();

  const { addNotification } = useNotifications();
  const { direction } = useDirectionStore();
  const { user } = useUserStore();
  const { selectedMarket } = useMarketStore();

  const currentChain = useChainId();
  const signer = useEthersSigner({ chainId: currentChain });

  const [tradeSimulation, setTradeSimulation] =
    useState<SimulationResult | null>(null);

  // NEW: зберігаємо обидві величини з симуляції (rUSD/base).
  const [orderAmountInBase, setOrderAmountInBase] = useState<number | null>(
    null,
  );
  const [orderAmountInSize, setOrderAmountInSize] = useState<number | null>(
    null,
  ); // NEW

  const [inputError, setInputError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isTrading, setIsTrading] = useState<boolean>(false);

  // Логіка, що керує розміром кредитного плеча та обсягом ордера:
  const {
    sliderValue,
    setSliderValue,
    realLeverage,
    minBound,
    maxBound,
    amount,
    setAmount,
    maxAvailableOrderSize,
    debouncedAmount,
    loading: leverageLoading,
  } = useLeverageIsolatedTrade({ direction });

  // NEW: Вибір одиниці виміру
  const units = useMemo(
    () => [
      { label: "rUSD", value: "maxAmountSize" },
      {
        label: selectedMarket?.quoteToken || "BASE",
        value: "maxAmountBase",
      },
    ],
    [selectedMarket],
  );

  const [currentUnit, setCurrentUnit] = useState<
    "maxAmountSize" | "maxAmountBase"
  >("maxAmountSize");

  useEffect(() => {
    validateInputs();
  }, [currentUnit, direction]);

  const minValue = useMemo(() => {
    if (!selectedMarket || !maxAvailableOrderSize) return 0;
    return currentUnit === "maxAmountSize"
      ? selectedMarket.minOrderSize || 0
      : selectedMarket.minOrderSizeBase || 0;
  }, [selectedMarket, maxAvailableOrderSize, currentUnit]);

  const maxValue = useMemo(() => {
    if (!maxAvailableOrderSize) return 0;
    return currentUnit === "maxAmountSize"
      ? maxAvailableOrderSize.maxAmountSize || 0
      : maxAvailableOrderSize.maxAmountBase || 0;
  }, [maxAvailableOrderSize, currentUnit]);

  /**
   * Перевірка коректності введення:
   */
  const validateInputs = () => {
    const isLoadedAll =
      selectedMarket && user && maxAvailableOrderSize && +debouncedAmount;
    if (!isLoadedAll) {
      return false;
    }
    if (!maxValue) {
      setInputError("Max available order size is not defined");
      return false;
    }
    if (Number(debouncedAmount) > maxValue) {
      setInputError("Cannot exceed Max trade size");
      return false;
    }
    // check min value
    if (Number(debouncedAmount) < minValue) {
      setInputError("Cannot be less than Min trade size");
      return false;
    }
    setInputError(null);
    return true;
  };

  const fetchSimulation = useCallback(async () => {
    validateInputs();
    // if (!debouncedAmount || !selectedMarket || !user) return;
    try {
      setIsFetching(true);

      const amountNumber = Number(debouncedAmount);
      const tradeAmount =
        direction === DIRECTION_TYPE.long ? amountNumber : -amountNumber;

      const fromBase = currentUnit === "maxAmountBase";

      const newSimulationHash =
        +tradeAmount +
        +realLeverage +
        (maxAvailableOrderSize?.maxAmountSize || 0) +
        (maxAvailableOrderSize?.maxAmountBase || 0) +
        (fromBase ? 1 : 0);

      if (hashSimulation === newSimulationHash) {
        return;
      }
      hashSimulation = newSimulationHash;

      const simulation = await simulateIsolatedTradeService({
        amount: tradeAmount,
        fromBase, // NEW
        isolatedPositionLeverage: realLeverage,
      });
      const uiSimulation =
        mapSimulateIsolatedTradeResultToSimulateIsolatedTradeUI(simulation);
      setTradeSimulation(uiSimulation);

      // NEW: зберігаємо обидва значення (base та size)
      if (simulation.snappedAmountInBase !== undefined) {
        setOrderAmountInBase(simulation.snappedAmountInBase);
      } else {
        setOrderAmountInBase(Math.abs(tradeAmount));
      }
      if (simulation.snappedAmount !== undefined) {
        setOrderAmountInSize(simulation.snappedAmount);
      } else {
        setOrderAmountInSize(Math.abs(tradeAmount));
      }
    } catch (error) {
      console.error("Error fetching simulation:", error);
      if (+amount > 0) {
        addNotification({
          title: "Error fetching simulation",
          type: "error",
          statusText: "// Error",
        });
      }
    } finally {
      setIsFetching(false);
    }
  }, [
    direction,
    debouncedAmount,
    validateInputs,
    selectedMarket,
    user,
    addNotification,
    realLeverage,
    maxAvailableOrderSize,
    currentUnit,
  ]);

  useEffect(() => {
    if (!selectedMarket || !user) return;
    void fetchSimulation();
  }, [debouncedAmount, selectedMarket, user, fetchSimulation, currentUnit]);

  const currentMarkPrice = getCurrentMarketPrice(selectedMarket?.ticker);

  const {
    stopLoss,
    takeProfit,
    errors,
    info,
    setStopLoss,
    setTakeProfit,
    // createStopLossOrder,
    // createTakeProfitOrder
  } = useConditionalOrderParams({
    marginAccountId: user?.id as number,
    market: selectedMarket as ConditionalOrderMarket,
    signer,
    side: direction,
    averageEntryPrice: currentMarkPrice || selectedMarket?.markPrice || null,
    base: orderAmountInBase,
    isExistingPosition: false,
  });

  const handleTrade = async () => {
    if (!user || !selectedMarket || !tradeSimulation || !orderAmountInBase) {
      console.warn("Trade aborted: missing necessary data");
      return;
    }
    refreshWalletMetadata();

    const { coreSigNonce, address } = selectWalletMetadata() || {};

    const params: IsolatedTradeParams = {
      amountInBase:
        direction === DIRECTION_TYPE.long
          ? orderAmountInBase
          : -orderAmountInBase,
      editCollateralActions: tradeSimulation.editCollateralActions,
      fromMarginAccountId: user.id,
      market: {
        baseSpacing: selectedMarket.baseSpacing,
        counterpartyAccountIds: selectedMarket.orderInfo.counterpartyAccountIds,
        currentPrice:
          tradeSimulation?.estimatedPrice || selectedMarket.markPrice,
        exchangeId: 4,
        id: selectedMarket.id,
        minOrderSizeBase: selectedMarket.minOrderSizeBase,
      },
      owner: {
        address: address,
        coreSigNonce: coreSigNonce,
      },
      // @ts-ignore
      signer,
    };
    // console.log("params", params);
    try {
      setIsTrading(true);

      addNotification({
        type: "warning",
        title: selectedMarket.ticker,
        subTitle: direction === DIRECTION_TYPE.long ? "Long" : "Short",
        icon: hasIcon(selectedMarket.quoteToken)
          ? getIcon(selectedMarket.quoteToken)
          : "default",
        statusText: "// Pending",
        amount: `${debouncedAmount} rUSD`,
        executionPrice: `${tradeSimulation.estimatedExecutionPriceFormatted} rUSD`,
      });

      const result = await isolatedTradeService(params);
      console.info("Trade successful:", result);
      const { updatedUser: newUser } = await getOrCreateMainAccount(
        address,
        result.marginAccountId,
      );
      const newAccount = {
        account: rebuildAccount(account),
        ...newUser,
      };
      // addNotification({
      //   message: `${orderAmountInBase} ${selectedMarket.quoteToken} ${
      //     direction === DIRECTION_TYPE.long ? "long" : "short"
      //   }`,
      //   type: "info",
      //   title: "Perpetual",
      //   subTitle: "LP Pool",
      //   statusText: `// Success`,
      //   amount: `${orderAmountInBase} ${selectedMarket.quoteToken}`,
      //   executionPrice: `${tradeSimulation.estimatedExecutionPriceFormatted} rUSD`,
      // });

      addNotification({
        message: `${orderAmountInBase} ${selectedMarket.quoteToken} ${direction === DIRECTION_TYPE.long ? "long" : "short"}`,
        type: "info",
        title: selectedMarket.ticker,
        subTitle: direction === DIRECTION_TYPE.long ? "Long" : "Short",
        icon: hasIcon(selectedMarket.quoteToken)
          ? getIcon(selectedMarket.quoteToken)
          : "default",
        statusText: "// Successful",
        amount: `${debouncedAmount} rUSD`,
        executionPrice: `${tradeSimulation.estimatedExecutionPriceFormatted} rUSD`,
      });

      useUserStore.getState().setUser(
        // @ts-ignore
        newAccount,
      );
      console.log("newUser", newUser);
      const currentPosition = newUser?.positions?.[0] || null;
      if (
        (result && stopLoss && toggleShowSLTP && currentPosition) ||
        (result && takeProfit && toggleShowSLTP && currentPosition)
      ) {
        try {
          await checkIsConditionalOrdersPermissionGranted(
            currentPosition?.accountId,
          );
          await checkIsConditionalOrdersPermissionGrantedToEmbeddedWallet(
            currentPosition?.accountId,
          );

          await grantTradePermission({
            // @ts-ignore
            signer,
            accountId: currentPosition?.accountId,
          });
          addNotification({
            title: "Permission granted",
            type: "success",
            statusText: "// Success",
          });
          const sleep = (ms: number) =>
            new Promise((resolve) => setTimeout(resolve, ms));
          await sleep(3000);
          await grantTradePermissionToEmbeddedWallet({
            // @ts-ignore
            signer,
            accountId: currentPosition?.accountId,
          });
          addNotification({
            title: "Permission for wallet granted",
            type: "success",
            statusText: "// Success",
          });
          if (result && stopLoss && toggleShowSLTP && currentPosition) {
            const params = {
              // @ts-ignore
              signer,
              marginAccountId: currentPosition.accountId,
              triggerPrice: +stopLoss,
              orderType: ConditionalOrderMap.STOP_LOSS,
              marketId: selectedMarket.id,
              supportingParams: {
                counterpartyAccountIds:
                  selectedMarket.orderInfo.counterpartyAccountIds,
                currentPrice: currentMarkPrice || selectedMarket.markPrice,
                exchangeId: 4,
              },
              amountInBase: orderAmountInBase,
            };
            console.log("updateConditionalOrder SL params ", params);
            const result = await registerConditionalOrder(
              params as unknown as UpdateConditionalOrderParams,
            );
            console.log("updateConditionalOrder SL result", result);
            addNotification({
              title: "SL order created",
              type: "success",
              statusText: "// Success",
            });
          }
          if (result && takeProfit && toggleShowSLTP && currentPosition) {
            const params = {
              // @ts-ignore
              signer,
              marginAccountId: currentPosition.accountId,
              triggerPrice: +takeProfit,
              orderType: ConditionalOrderMap.TAKE_PROFIT,
              marketId: selectedMarket.id,
              supportingParams: {
                counterpartyAccountIds:
                  selectedMarket.orderInfo.counterpartyAccountIds,
                currentPrice: currentMarkPrice || selectedMarket.markPrice,
                exchangeId: 4,
              },
              amountInBase: orderAmountInBase,
            };
            console.log("updateConditionalOrder TP params ", params);
            const result = await registerConditionalOrder(
              params as unknown as UpdateConditionalOrderParams,
            );
            console.log("updateConditionalOrder TP result", result);
            addNotification({
              title: "TP order created",
              type: "success",
              statusText: "// Success",
            });
          }
        } catch (error) {
          addNotification({
            // @ts-ignore
            title: error?.message || "Error granting permission",
            type: "error",
            statusText: "// Error",
          });
          addNotification({
            title: "SL/TP order failed",
            type: "error",
            statusText: "// Error",
          });

          return false;
        } finally {
          setIsTrading(false);
        }
      }
      console.log("currentPosition", currentPosition);

      setTradeSimulation(null);
      setOrderAmountInBase(null);
      setOrderAmountInSize(null); // NEW
      setAmount("");
    } catch (error: any) {
      console.error("Trade failed:", error);
      addNotification({
        title:
          error?.message ||
          error?.response?.data?.message ||
          "Something went wrong",
        type: "error",
        statusText: "// Error",
      });
    } finally {
      setIsTrading(false);
      setIsFetching(false);
      if (toggleShowSLTP) {
        setToggleShowSLTP(false);
      }
    }
  };

  const [isOpenDepositModal, setIsOpenDepositModal] = useState(false);
  const onSuccessfulDepositHandler = () => {
    setIsOpenDepositModal(false);
  };

  return (
    <div className={s.trade_form}>
      <Modal
        isOpen={isOpenDepositModal}
        onClose={() => setIsOpenDepositModal(false)}
      >
        <DepositModal onSuccessfulDeposit={onSuccessfulDepositHandler} />
      </Modal>
      <ConnectModal />

      <div className={s.leverage_slider}>
        <div className={s.leverage_slider__header}>
          <div>Leverage</div>
          <div className={s.leverage_slider__value}>
            <CustomInput
              checkMax
              blockMax
              isNumber
              value={sliderValue}
              onChange={(e) => {
                setSliderValue(+e.target.value);
              }}
              disabled={
                !isLoggedIn ||
                !user ||
                leverageLoading ||
                isTrading ||
                isFetching ||
                !selectedMarket
              }
              placeholder="0"
              inputWrapperClassName={s.leverage_input_wrapper}
              inputClassName={s.leverage_input_wrapper}
              min={1}
              max={maxBound}
            />
            <span>X</span>
          </div>
        </div>

        <RangeSlider
          showMarks
          value={sliderValue}
          setValue={setSliderValue}
          min={minBound || 1}
          max={maxBound}
          step={1}
          disabled={
            !isLoggedIn ||
            !user ||
            leverageLoading ||
            isTrading ||
            !selectedMarket
          }
          suffix="X"
        />
      </div>

      {/* ---------------- SIZE + CurrentUnit SELECT ---------------- */}
      <div className={s.trade_form__header}>
        <p>
          Size{" "}
          <span>
            {/* NEW: приблизне відображення залежно від currentUnit */}≈{" "}
            {currentUnit === "maxAmountSize"
              ? `${orderAmountInBase?.toFixed(2) || 0} ${
                  selectedMarket?.quoteToken ?? ""
                }`
              : `${orderAmountInSize?.toFixed(2) || 0} rUSD`}
          </span>
        </p>
        <span className={s.trade_form__balance}>
          Balance: {user?.totalBalanceFormatted?.value || 0} rUSD
          <Button
            onClick={() => setIsOpenDepositModal(true)}
            disabled={!isLoggedIn || !user}
            variant={"system"}
            className={s.deposit_btn}
          >
            Deposit
          </Button>
        </span>
      </div>

      <CustomInput
        isNumber
        value={amount}
        error={inputError}
        onChange={(e) => {
          setAmount(e.target.value);
        }}
        disabled={isTrading || !maxAvailableOrderSize}
        placeholder="0.00"
        inputWrapperClassName={s.trade_input_wrapper}
        // NEW: Селект для вибору одиниці (rUSD або base)
        customButton={
          <div className={s.trade_input__additional}>
            <Loader
              width="12px"
              height="12px"
              show={leverageLoading || isTrading || isFetching}
            />
            <CustomSelect
              className={s.trade_input_value_wrapper}
              selectContentClassName={s.trade_input_value_content}
              selectLabelClassName={s.trade_input_value_select}
              placeholder="Select order value"
              isDisabled={!selectedMarket || !maxAvailableOrderSize}
              options={units}
              value={{
                label: units.find((unit) => unit.value === currentUnit)?.label,
                value: currentUnit,
              }}
              onChange={(newVal) =>
                setCurrentUnit(
                  newVal.value as "maxAmountSize" | "maxAmountBase",
                )
              }
            />
          </div>
        }
      />
      <PercentageButtons
        min={minValue}
        amount={+amount}
        setAmount={setAmount}
        maxValue={
          maxAvailableOrderSize ? maxAvailableOrderSize?.[currentUnit] : 0
        }
        disabled={
          isTrading ||
          !maxAvailableOrderSize?.[currentUnit] ||
          !selectedMarket ||
          !isLoggedIn ||
          !user
        }
      />

      <SlTpComponent
        info={info}
        stopLoss={stopLoss}
        setStopLoss={setStopLoss}
        errors={errors}
        takeProfit={takeProfit}
        setTakeProfit={setTakeProfit}
        isTrading={isTrading}
        maxAvailableOrderSize={maxAvailableOrderSize}
        setToggleShow={setToggleShowSLTP}
        toggleShow={toggleShowSLTP}
        disabled={
          isTrading ||
          !maxAvailableOrderSize?.[currentUnit] ||
          !selectedMarket ||
          !isLoggedIn ||
          !user
        }
      />

      <Block
        className={s.trade__info}
        opacityLvl={5}
        isLoading={!isLoggedIn}
        showLoader={false}
      >
        <InfoItem
          title="Min/Max Size"
          show={!!tradeSimulation}
          value={`
            ${
              currentUnit === "maxAmountSize"
                ? minValue?.toFixed(2)
                : minValue?.toFixed(selectedMarket?.tickSizeDecimals || 0)
            } ${
              currentUnit === "maxAmountSize"
                ? "rUSD"
                : selectedMarket?.quoteToken
            }
          /
          ${maxAvailableOrderSize?.[currentUnit]?.toFixed(2)} ${currentUnit === "maxAmountSize" ? "rUSD" : selectedMarket?.quoteToken}
          `}
        />
        <InfoItem
          title="Required Margin"
          show={!!tradeSimulation}
          value={tradeSimulation?.requiredMarginFormatted?.value || ""}
          symbol="rUSD"
        />
        <InfoItem
          title="Est. Liquidation Price"
          show={!!tradeSimulation}
          value={tradeSimulation?.liquidationPriceFormatted?.value || ""}
          symbol="rUSD"
        />
        <InfoItem
          title="Fees"
          show={!!tradeSimulation}
          value={tradeSimulation?.feesFormatted?.value || ""}
          symbol="rUSD"
        />
        <InfoItem
          title="Estimated Slippage"
          show={!!tradeSimulation}
          value={tradeSimulation?.estimatedSlippageFormatted || ""}
          symbol="%"
        />
      </Block>
      <div>
        {!isTradePermissionGranted ? <TradePermission /> : null}
        {!isTradePermissionGrantedForEmbeddedWallet ? (
          <TradePermission onlyWalletPermission />
        ) : null}
      </div>
      {isLoggedIn ? (
        <Button
          variant="primary"
          className={s.trade__button}
          onClick={handleTrade}
          disabled={
            !account ||
            isTrading ||
            isFetching ||
            leverageLoading ||
            !tradeSimulation ||
            !user ||
            !selectedMarket ||
            !signer ||
            !!inputError ||
            (toggleShowSLTP && !!errors?.stopLoss) ||
            (toggleShowSLTP && !!errors?.takeProfit) ||
            !isTradePermissionGranted ||
            !isTradePermissionGrantedForEmbeddedWallet
          }
        >
          Trade
        </Button>
      ) : (
        <Button
          variant="primary"
          className={s.trade__button__no_connected}
          onClick={requireAuth}
        >
          Connect
        </Button>
      )}
    </div>
  );
};

const InfoItem: FC<{
  title: string;
  value: any;
  show?: boolean;
  symbol?: string;
  style?: React.CSSProperties;
}> = React.memo(({ title, value, style, show, symbol = "" }) => {
  return (
    <div className={clsx(s.info_item)} style={style}>
      <div className={s.info_item__title}>{title}</div>
      <div className={s.info_item__value}>
        {show && value ? `${value} ${symbol}` : "---"}
      </div>
    </div>
  );
});

export default IsolatedTradeForm;
