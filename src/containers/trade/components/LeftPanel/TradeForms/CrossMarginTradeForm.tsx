"use client";
import { useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { ApiClient } from "@reyaxyz/api-sdk";
import { MatchOrderParams } from "@reyaxyz/sdk";
import clsx from "clsx";
import React, { FC, useEffect, useMemo, useState } from "react";
import { useAccount, useChainId } from "wagmi";

import { getCurrentMarketPrice } from "@/containers/trade/components/InfoData";
import { useDirectionStore } from "@/containers/trade/components/LeftPanel/DirectionPicker/direction.store";
import { DIRECTION_TYPE } from "@/containers/trade/components/LeftPanel/trade-panel.types";
import {
  ConditionalOrderMarket,
  useConditionalOrderParams,
} from "@/containers/trade/components/LeftPanel/TradeForms/hooks/useConditionalOrderParams";
import { useLeverageCrossMarginTrade } from "@/containers/trade/components/LeftPanel/TradeForms/hooks/useLeverageCrossMarginTrade";
import PercentageButtons from "@/containers/trade/components/LeftPanel/TradeForms/PercentageButtons";
import { useNotifications } from "@/providers/notifications/useNotifications";
import { crossMarginTradeService } from "@/services/trade-form/cross-margin-trade-form/crossMarginTradeService";
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
  mapSimulateIsolatedTradeResultToSimulateIsolatedTradeUI,
} from "@/shared/utils/_common/mappers";
import { formatNumber } from "@/shared/utils/numberUtils";

import SlTpComponent from "./SlTpComponent";
import s from "./trade-forms.module.scss";
import {
  getIcon,
  hasIcon,
} from "../../../../../../public/assets/icons/coins/avalible_icons";

type SimulationResult = ReturnType<
  typeof mapSimulateIsolatedTradeResultToSimulateIsolatedTradeUI
>;
let hashSimulation: number | null = null;

const CrossMarginTradeForm: FC = () => {
  const {
    isTradePermissionGranted,
    isTradePermissionGrantedForEmbeddedWallet,
  } = useTradePermissionStore();
  const [toggleShowSLTP, setToggleShowSLTP] = useState(false);
  const isLoggedIn = useIsLoggedIn();
  const { requireAuth, ConnectModal } = useRequireAuthFlow({
    showCustomModal: false,
  });
  const account = useAccount();

  const { addNotification } = useNotifications();
  const currentChain = useChainId();
  const signer = useEthersSigner({ chainId: currentChain });
  const { direction } = useDirectionStore();
  const { user, ownerMetadata } = useUserStore();
  const { selectedMarket } = useMarketStore();

  const [tradeSimulation, setTradeSimulation] =
    useState<SimulationResult | null>(null);
  const [orderAmountInBase, setOrderAmountInBase] = useState<number | null>(
    null,
  );
  const [orderAmountInSize, setOrderAmountInSize] = useState<number | null>(
    null,
  );
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isTrading, setIsTrading] = useState<boolean>(false);
  const [inputError, setInputError] = useState<string | null>(null);
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
  } = useLeverageCrossMarginTrade({ direction });

  const units = useMemo(() => {
    return [
      {
        label: "rUSD",
        value: "maxAmountSize",
      },
      {
        label: selectedMarket?.quoteToken,
        value: "maxAmountBase",
      },
    ];
  }, [selectedMarket]);

  const [currentUnit, setCurrentUnit] = useState<
    "maxAmountSize" | "maxAmountBase"
  >("maxAmountSize");

  useEffect(() => {
    validateInputs();
  }, [currentUnit, direction]);

  const currentMarkPrice = getCurrentMarketPrice(selectedMarket?.ticker);

  const {
    stopLoss,
    takeProfit,
    errors,
    info,
    setStopLoss,
    setTakeProfit,
    createStopLossOrder,
    createTakeProfitOrder,
  } = useConditionalOrderParams({
    marginAccountId: user?.id as number,
    market: selectedMarket as ConditionalOrderMarket,
    signer,
    side: direction,
    averageEntryPrice: currentMarkPrice || selectedMarket?.markPrice || null,
    base: orderAmountInBase,
    isExistingPosition: false,
  });
  const minValue = useMemo(() => {
    if (!maxAvailableOrderSize) return 0;
    return currentUnit === "maxAmountSize"
      ? selectedMarket?.minOrderSize || 0
      : selectedMarket?.minOrderSizeBase || 0;
  }, [maxAvailableOrderSize, currentUnit]);

  const validateInputs = () => {
    const isLoadedAll =
      selectedMarket && user && maxAvailableOrderSize && +debouncedAmount;
    if (!isLoadedAll) {
      return false;
    }
    if (Number(debouncedAmount) < minValue) {
      setInputError("Cannot be less than Min trade size");
      return false;
    }
    if (!maxAvailableOrderSize?.maxAmountSize) {
      setInputError("Max available order size is not defined");
      return false;
    }

    if (
      Number(debouncedAmount) >
      maxAvailableOrderSize?.maxAmountSize + 0.0001
    ) {
      setInputError("Cannot exceed Max trade size");
      return false;
    }

    setInputError(null);
    return true;
  };

  const fetchSimulation = async () => {
    validateInputs();

    try {
      setIsFetching(true);
      const amountNumber = Number(debouncedAmount);
      const tradeAmount =
        direction === DIRECTION_TYPE.long ? amountNumber : -amountNumber;

      const newSimulationHash =
        +tradeAmount +
        +realLeverage +
        // @ts-ignore
        maxAvailableOrderSize?.maxAmountSize +
        // @ts-ignore
        maxAvailableOrderSize?.maxAmountBase;
      if (hashSimulation === newSimulationHash) {
        return;
      }

      if (typeof newSimulationHash === "number") {
        hashSimulation = newSimulationHash;
      }

      const params = {
        amount: tradeAmount,
        fromBase: currentUnit === "maxAmountBase",
      };
      if (!realLeverage && leverageLoading) return;

      const simulation = await ApiClient.tradeSimulation.simulate(params);
      const uiSimulation =
        mapSimulateCrossMarginTradeResultToSimulateCrossMarginTradeUI(
          simulation,
        );

      // @ts-ignore
      setTradeSimulation((prev) => {
        const newVal = {
          ...prev,
          ...uiSimulation,
        };
        if (JSON.stringify(prev) === JSON.stringify(newVal)) {
          return prev;
        }
        return newVal;
      });
      setOrderAmountInBase(simulation.snappedAmountInBase);
      setOrderAmountInSize(simulation.snappedAmount);
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
  };

  useEffect(() => {
    if (!selectedMarket || !user) {
      return;
    }
    void fetchSimulation();
  }, [user, debouncedAmount, selectedMarket]);

  const handleTrade = async () => {
    console.log("Trade button clicked", {
      user,
      selectedMarket,
      tradeSimulation,
      orderAmountInBase,
      amount,
      debouncedAmount,
      isTrading,
      isFetching,
      leverageLoading,
      signer,
    });
    if (!user || !selectedMarket || !tradeSimulation || !orderAmountInBase) {
      console.warn("Trade aborted: missing necessary data");
      return;
    }

    const amountInBase = orderAmountInBase;

    const params: MatchOrderParams = {
      owner: {
        coreSigNonce: ownerMetadata.coreSigNonce,
      },
      marginAccountId: user.id,
      amountInBase,
      market: {
        baseSpacing: selectedMarket.baseSpacing,
        counterpartyAccountIds: selectedMarket.orderInfo.counterpartyAccountIds,
        currentPrice: currentMarkPrice || selectedMarket.markPrice,
        exchangeId: 4,
        id: selectedMarket.id,
        minOrderSizeBase: selectedMarket.minOrderSizeBase,
      },
      tradeSource: "reya",
      // @ts-ignore
      signer,
    };

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
      const result = await crossMarginTradeService(params);
      if (stopLoss && toggleShowSLTP) {
        await createStopLossOrder();
      }
      if (takeProfit && toggleShowSLTP) {
        await createTakeProfitOrder();
      }
      setTradeSimulation(null);
      setOrderAmountInBase(null);
      setOrderAmountInSize(null);
      setAmount("");
      addNotification({
        message: `${orderAmountInBase} ${selectedMarket.quoteToken} ${direction === DIRECTION_TYPE.long ? "long" : "short"}`,
        type: "info",
        title: "Perpetual",
        subTitle: "LP Pool",
        statusText: `// Success`,
        amount: `${debouncedAmount} rUSD`,
        executionPrice: `${tradeSimulation.estimatedExecutionPriceFormatted} rUSD`,
      });
      console.info("Trade successful:", result);
      useUserStore
        .getState()
        // @ts-ignore
        .updateUserInBackground(rebuildAccount(account));
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
              // className={s.leverage_input_wrapper}
              inputWrapperClassName={s.leverage_input_wrapper}
              inputClassName={s.inputClassName}
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
            isFetching ||
            !selectedMarket
          }
          suffix="X"
        />
      </div>
      <div className={s.trade_form__header}>
        <p>
          Size{" "}
          <span>
            ≈{" "}
            {currentUnit === "maxAmountSize"
              ? `${formatNumber(orderAmountInBase as number)} ${selectedMarket?.quoteToken}`
              : `${formatNumber(orderAmountInSize as number)} rUSD`}
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
          validateInputs();
        }}
        disabled={isTrading || !maxAvailableOrderSize}
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
        min={
          (selectedMarket?.minOrderSize &&
            (+selectedMarket?.minOrderSize?.toFixed(2) as number)) ||
          0
        }
        max={
          (maxAvailableOrderSize?.[currentUnit] &&
            Math.floor(maxAvailableOrderSize?.[currentUnit] * 100) / 100) ||
          0
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
          ${formatNumber(maxAvailableOrderSize?.[currentUnit] as number)} ${currentUnit === "maxAmountSize" ? "rUSD" : selectedMarket?.quoteToken}
          `}
        />
        <InfoItem
          show={!!tradeSimulation?.requiredMarginFormatted}
          title="Required Margin"
          symbol="rUSD"
          value={tradeSimulation?.requiredMarginFormatted?.value || ""}
        />
        <InfoItem
          show={!!tradeSimulation?.liquidationPriceFormatted}
          title="Est. Liquidation Price"
          symbol="rUSD"
          value={tradeSimulation?.liquidationPriceFormatted?.value || ""}
        />
        <InfoItem
          show={!!tradeSimulation?.feesFormatted}
          title="Fees"
          symbol="rUSD"
          value={tradeSimulation?.feesFormatted?.value || ""}
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
            !amount ||
            isFetching ||
            leverageLoading ||
            !tradeSimulation ||
            !user ||
            !selectedMarket ||
            !signer ||
            !!inputError ||
            (toggleShowSLTP && !!errors?.stopLoss) ||
            (toggleShowSLTP && !!errors?.takeProfit)
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

export default CrossMarginTradeForm;
