"use client";
import { useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import clsx from "clsx";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useChainId } from "wagmi";

import { getCurrentMarketPrice } from "@/containers/trade/components/InfoData";
import { useDirectionStore } from "@/containers/trade/components/LeftPanel/DirectionPicker/direction.store";
import { DIRECTION_TYPE } from "@/containers/trade/components/LeftPanel/trade-panel.types";
import PercentageButtons from "@/containers/trade/components/LeftPanel/TradeForms/PercentageButtons";
import { useNotifications } from "@/providers/notifications/useNotifications";
import {
  RegisterConditionalOrderParams,
  registerConditionalOrderService,
} from "@/services/conditional-orders/services";
import {
  SimulateCrossMarginLimitTradeParams,
  simulateCrossMarginLimitTradeService,
} from "@/services/trade-form/simulateCrossMarginLimitOderTradeService";
import DepositModal from "@/shared/components/modals/DepositModal";
import TradePermission from "@/shared/components/TradePermission";
import { useTradePermissionStore } from "@/shared/components/TradePermission/useTradePermissionStore";
import Block from "@/shared/components/ui/Block";
import { Button } from "@/shared/components/ui/Button/button";
import CustomInput from "@/shared/components/ui/Input";
import Loader from "@/shared/components/ui/Loader/Loader";
import Modal from "@/shared/components/ui/Modal";
import RangeSlider from "@/shared/components/ui/Range";
import CustomSelect from "@/shared/components/ui/Select";
import { useRequireAuthFlow } from "@/shared/hooks/useRequireAuthFlow";
import { rebuildAccount } from "@/shared/hooks/useUserSync";
import { useEthersSigner } from "@/shared/hooks/walletUtils";
import { useMarketStore } from "@/shared/store/useMarketStore";
import useUserStore from "@/shared/store/user.store";
import {
  mapSimulateCrossMarginTradeResultToSimulateCrossMarginTradeUI,
  SimulateCrossMarginTradeResult,
  SimulateCrossMarginTradeUI,
} from "@/shared/utils/_common/mappers";
import { formatNumber } from "@/shared/utils/numberUtils";

import { useLeverageCrossMarginLimitTrade } from "./hooks/useLeverageCrossMarginLimitTrade";
import s from "./trade-forms.module.scss";
import {
  getIcon,
  hasIcon,
} from "../../../../../../public/assets/icons/coins/avalible_icons";

type SimulationResult = ReturnType<
  typeof mapSimulateCrossMarginTradeResultToSimulateCrossMarginTradeUI
>;

let hashSimulation: number | null = null;

const CrossMarginLimitTradeForm: FC = () => {
  const [toggleShowSLTP, setToggleShowSLTP] = useState(false);
  const {
    isTradePermissionGranted,
    isTradePermissionGrantedForEmbeddedWallet,
  } = useTradePermissionStore();

  const isLoggedIn = useIsLoggedIn();
  const { requireAuth, ConnectModal } = useRequireAuthFlow({
    showCustomModal: false,
  });
  const { addNotification } = useNotifications();
  const currentChain = useChainId();
  const signer = useEthersSigner({ chainId: currentChain });
  const account = useAccount();

  const { direction } = useDirectionStore();
  const { user } = useUserStore();
  const { selectedMarket } = useMarketStore();

  const {
    sliderValue,
    setSliderValue,
    realLeverage,
    minBound,
    maxBound,
    amount,
    setAmount,
    limitPrice,
    setLimitPrice,
    maxAvailableOrderSize,
    debouncedAmount,
    debouncedLimitPrice,
    loading: leverageLoading,
  } = useLeverageCrossMarginLimitTrade({
    direction,
    defaultLimitPrice: selectedMarket
      ? direction === DIRECTION_TYPE.long
        ? Math.floor(selectedMarket?.markPrice).toFixed(0)
        : Math.ceil(selectedMarket?.markPrice).toFixed(0)
      : "",
  });

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

  const [tradeSimulation, setTradeSimulation] = useState<
    SimulationResult | SimulateCrossMarginTradeUI | null
  >(null);
  const [orderAmountInBase, setOrderAmountInBase] = useState<number | null>(
    null,
  );
  const [orderAmountInSize, setOrderAmountInSize] = useState<number | null>(
    null,
  );

  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isTrading, setIsTrading] = useState<boolean>(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [limitInputError, setLimitInputError] = useState<string | null>(null);

  const validateInputs = () => {
    const isLoadedAll =
      selectedMarket && user && maxAvailableOrderSize && +debouncedAmount;
    if (!isLoadedAll) {
      return false;
    }
    if (!selectedMarket) {
      setInputError("Market not selected");
      return false;
    }
    if (!user) {
      setInputError("No user data");
      return false;
    }
    if (!debouncedLimitPrice) {
      setInputError("");
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

    const currentMarkPrice = getCurrentMarketPrice(selectedMarket.ticker);
    const marketPrice = currentMarkPrice || selectedMarket.markPrice;
    if (
      !!debouncedLimitPrice &&
      direction === DIRECTION_TYPE.long &&
      +debouncedLimitPrice >= marketPrice
    ) {
      setLimitInputError("Limit price must be lower than the market price.");
      return false;
    }
    if (
      !!debouncedLimitPrice &&
      direction === DIRECTION_TYPE.short &&
      +debouncedLimitPrice <= marketPrice
    ) {
      setLimitInputError("Limit price must be higher than the market price.");
      return false;
    }
    setLimitInputError(null);
    setInputError(null);
    return true;
  };

  const fetchZeroSimulationHandler = useCallback(() => {
    if (!selectedMarket || !user) return;
    if (!debouncedAmount || !debouncedLimitPrice) {
      setTradeSimulation(null);
      setOrderAmountInBase(null);
      setOrderAmountInSize(null);
    }
  }, [selectedMarket, user, debouncedAmount, debouncedLimitPrice]);

  const fetchSimulation = useCallback(async () => {
    validateInputs();
    try {
      setIsFetching(true);
      const amountNumber = Number(debouncedAmount);
      const tradeAmount =
        direction === DIRECTION_TYPE.long ? amountNumber : -amountNumber;

      const fromBase = currentUnit === "maxAmountBase";

      const newSimulationHash =
        tradeAmount +
        realLeverage +
        (maxAvailableOrderSize?.maxAmountSize || 0) +
        (maxAvailableOrderSize?.maxAmountBase || 0) +
        +debouncedLimitPrice +
        (fromBase ? 1 : 0);

      if (hashSimulation === newSimulationHash) {
        return;
      }
      hashSimulation = newSimulationHash;

      const params: SimulateCrossMarginLimitTradeParams = {
        amount: tradeAmount,
        fromBase,
        triggerPrice: +debouncedLimitPrice,
      };

      const simulation = await simulateCrossMarginLimitTradeService(params);
      const uiSimulation =
        mapSimulateCrossMarginTradeResultToSimulateCrossMarginTradeUI(
          simulation as SimulateCrossMarginTradeResult,
        );

      // @ts-ignore
      setTradeSimulation((prev) => {
        const newVal = prev ? { ...prev, ...uiSimulation } : uiSimulation;
        if (JSON.stringify(prev) === JSON.stringify(newVal)) {
          return prev;
        }
        return newVal;
      });

      setOrderAmountInBase(simulation.snappedAmountInBase);
      setOrderAmountInSize(simulation.snappedAmount);
    } catch (error) {
      console.error("Error fetching LIMIT simulation:", error);
      if (+amount > 0) {
        addNotification({
          title: "Error fetching LIMIT info",
          type: "error",
          statusText: "// Error",
        });
      }
    } finally {
      setIsFetching(false);
    }
  }, [
    validateInputs,
    user,
    selectedMarket,
    direction,
    debouncedAmount,
    debouncedLimitPrice,
    addNotification,
    signer,
    setAmount,
    setLimitPrice,
    realLeverage,
    maxAvailableOrderSize,
    currentUnit, // NEW
  ]);

  useEffect(() => {
    if (!selectedMarket || !user) {
      // fetchZeroSimulationHandler();
      return;
    }
    void fetchSimulation();
  }, [
    selectedMarket,
    user,
    debouncedAmount,
    debouncedLimitPrice,
    fetchSimulation,
    fetchZeroSimulationHandler,
  ]);
  const handleTrade = useCallback(async () => {
    if (!validateInputs()) return;
    if (!user || !selectedMarket || !tradeSimulation || !orderAmountInBase) {
      console.warn("Trade aborted: missing data");
      return;
    }
    try {
      setIsTrading(true);

      addNotification({
        message: `${orderAmountInBase} ${selectedMarket.quoteToken} ${direction === DIRECTION_TYPE.long ? "long" : "short"}`,
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
      const currentMarkPrice = getCurrentMarketPrice(selectedMarket?.ticker);
      const marketPrice = currentMarkPrice || selectedMarket.markPrice;

      const params: RegisterConditionalOrderParams = {
        amountInBase: orderAmountInBase,
        marginAccountId: user.id,
        marketId: selectedMarket.id,
        orderType: 2,
        // @ts-ignore
        signer,
        supportingParams: {
          counterpartyAccountIds:
            selectedMarket.orderInfo.counterpartyAccountIds,
          currentPrice: marketPrice,
          exchangeId: 4,
        },
        triggerPrice: +debouncedLimitPrice,
      };

      const result = await registerConditionalOrderService(params);
      console.log("LIMIT order successful:", result);

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

      setTradeSimulation(null);
      setOrderAmountInBase(null);
      setOrderAmountInSize(null); // NEW
      setAmount("");
      useUserStore.getState().updateUserInBackground(
        // @ts-ignore
        rebuildAccount(account),
      );
    } catch (error: any) {
      console.error("LIMIT Trade failed:", error);
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
  }, [
    validateInputs,
    user,
    selectedMarket,
    tradeSimulation,
    orderAmountInBase,
    direction,
    debouncedAmount,
    debouncedLimitPrice,
    addNotification,
    signer,
    setAmount,
    setLimitPrice,
    requireAuth,
  ]);

  const handleLimitPriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLimitPrice(e.target.value);
    },
    [setLimitPrice],
  );

  // Для зручності отримуємо min і max залежно від обраної currentUnit:
  const minValue = useMemo(() => {
    if (!maxAvailableOrderSize) return 0;
    return currentUnit === "maxAmountSize"
      ? maxAvailableOrderSize.minAmountSize || 0
      : maxAvailableOrderSize.minAmountBase || 0;
  }, [maxAvailableOrderSize, currentUnit]);

  const maxValue = useMemo(() => {
    if (!maxAvailableOrderSize) return 0;
    return currentUnit === "maxAmountSize"
      ? maxAvailableOrderSize.maxAmountSize || 0
      : maxAvailableOrderSize.maxAmountBase || 0;
  }, [maxAvailableOrderSize, currentUnit]);

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
          disabled={isTrading || !selectedMarket || !isLoggedIn || !user}
          suffix="X"
        />
      </div>

      <div className={clsx(s.trade_form__header)}>
        <p>
          Size{" "}
          <span>
            ≈{" "}
            {currentUnit === "maxAmountSize"
              ? `${formatNumber(orderAmountInBase || 0)} ${
                  selectedMarket?.quoteToken || ""
                }`
              : `${formatNumber(orderAmountInSize || 0)} rUSD`}
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
        disabled={isTrading || !maxAvailableOrderSize || !debouncedLimitPrice}
        placeholder="0.00"
        inputWrapperClassName={s.trade_input_wrapper}
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
        min={+minValue.toFixed(3) || 0}
        max={Math.floor(maxValue * 100) / 100 || 0}
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
      <div className={clsx(s.trade_form__header, s.trade_form__header__limit)}>
        <p>Limit Price</p>
      </div>
      <CustomInput
        isNumber
        error={limitInputError}
        value={limitPrice}
        onChange={handleLimitPriceChange}
        disabled={isTrading || !selectedMarket || !isLoggedIn}
        placeholder="0.00"
        inputWrapperClassName={s.trade_input_wrapper}
        rightIcon={<div className={s.stop_loss__right_icon}>rUSD</div>}
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
          show={!!tradeSimulation?.liquidationPriceFormatted}
          title="Est. Liquidation Price"
          symbol="rUSD"
          value={tradeSimulation?.liquidationPriceFormatted?.value || ""}
        />
        <InfoItem
          title="Fees"
          show={!!tradeSimulation}
          value={tradeSimulation?.feesFormatted?.value || ""}
          symbol="rUSD"
        />
        <InfoItem
          show={!!tradeSimulation?.estimatedSlippageFormatted}
          title="Estimated Slippage"
          symbol="%"
          value={tradeSimulation?.estimatedSlippageFormatted || ""}
        />
      </Block>

      {!isTradePermissionGranted ? <TradePermission /> : null}
      {!isTradePermissionGrantedForEmbeddedWallet ? (
        <TradePermission onlyWalletPermission />
      ) : null}
      {isLoggedIn ? (
        <Button
          variant="primary"
          className={s.trade__button}
          onClick={handleTrade}
          disabled={
            isTrading ||
            !account ||
            isFetching ||
            !tradeSimulation ||
            !orderAmountInBase ||
            !!inputError ||
            !isTradePermissionGranted ||
            !isTradePermissionGrantedForEmbeddedWallet ||
            !limitPrice ||
            !!limitInputError
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

export default CrossMarginLimitTradeForm;
