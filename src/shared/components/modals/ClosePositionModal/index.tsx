"use client";

import { CloseOrderParams } from "@reyaxyz/sdk";
import React, { FC } from "react";
import { useAccount, useChainId } from "wagmi";

import { getCurrentMarketPrice } from "@/containers/trade/components/InfoData";
import { useNotifications } from "@/providers/notifications/useNotifications";
import { closePositionService } from "@/services/margin-account/closePositionService";
import { crossMarginTradeService } from "@/services/trade-form/crossMarginTradeService";
import ClosePosButtons from "@/shared/components/modals/ClosePositionModal/ClosePosButtons";
import TradePermission from "@/shared/components/TradePermission";
import { useTradePermissionStore } from "@/shared/components/TradePermission/useTradePermissionStore";
import { Button } from "@/shared/components/ui/Button/button";
import { rebuildAccount } from "@/shared/hooks/useUserSync";
import { useEthersSigner } from "@/shared/hooks/walletUtils";
import useUserStore, {
  refreshWalletMetadata,
  selectWalletMetadata,
} from "@/shared/store/user.store";

import s from "./ConnectModal.module.scss";
import {
  getIcon,
  hasIcon,
} from "../../../../../public/assets/icons/coins/avalible_icons";

interface IClosePositionModal {
  onSuccessful: () => void;
  data: any;
}

export const closePositionHandler = async (
  marginAccountId: number,
  market: any,
  position: any,
  suppressNotification: boolean = false,
  addNotification: any,
  signer: any,
  account?: any,
): Promise<boolean> => {
  if (!position) return false;
  console.log("closePositionHandler", {
    marginAccountId,
    market,
    position,
    suppressNotification,
    signer,
  });
  const currentMarkPrice = getCurrentMarketPrice(market?.ticker);
  const metadata = selectWalletMetadata();
  try {
    const params: CloseOrderParams = {
      marginAccountId,
      market: {
        baseSpacing: market.baseSpacing,
        counterpartyAccountIds: market.orderInfo.counterpartyAccountIds,
        currentPrice: currentMarkPrice || market.markPrice,
        exchangeId: 4,
        id: market.id,
        minOrderSizeBase: market.minOrderSizeBase,
      },
      orderBase: position.base,
      owner: {
        coreSigNonce: metadata.coreSigNonce,
      },
      // @ts-ignore
      signer: signer as JsonRpcSigner,
    };
    console.log("params", params);
    await closePositionService(params);
    await refreshWalletMetadata();
    if (!suppressNotification) {
      addNotification({
        message: `${position.base} ${market.quoteToken}`,
        type: "info",
        title: market.baseToken,
        subTitle: "Perpetual",
        statusText: "// Position closed",
        amount: `${position.base} ${market.quoteToken}`,
        icon: market.baseToken,
      });
    }
    // @ts-ignore
    useUserStore.getState().updateUserInBackground(rebuildAccount(account));

    return true;
  } catch (error: any) {
    console.error("close position error", error);
    if (!suppressNotification) {
      addNotification({
        title:
          error?.message ||
          error?.response?.data?.message ||
          "Something went wrong",
        type: "error",
        statusText: "// Error",
      });
    }
    return false;
  }
};

const ClosePositionModalComponent: FC<IClosePositionModal> = ({
  onSuccessful,
  data,
}) => {
  const {
    isTradePermissionGranted,
    isTradePermissionGrantedForEmbeddedWallet,
  } = useTradePermissionStore();
  const { addNotification } = useNotifications();
  const { market, accountId, position } = data;
  const [amount, setAmount] = React.useState(position?.base);

  const currentChain = useChainId();
  const signer = useEthersSigner({ chainId: currentChain });
  const { user } = useUserStore();
  const account = useAccount();
  const [closePercentage, setClosePercentage] = React.useState<number>(100);
  console.log("closePercentage", closePercentage);

  console.log("pos", {
    market,
    accountId,
    position,
  });
  console.log("amount", amount);

  async function createNewReversePose() {
    // Отримуємо поточну ринкову ціну
    const currentMarkPrice = getCurrentMarketPrice(market.ticker);

    // Визначаємо зворотну сторону: якщо позиція short, то відкриваємо long, і навпаки
    const reverseSide = position.side === "short" ? "long" : "short";

    // Розраховуємо обсяг для зворотного трейду (часткове закриття)
    const partialAmount =
      reverseSide === "long" ? Math.abs(amount) : -1 * Math.abs(amount); // amount встановлено через кнопки процентів
    console.log("partialAmount", partialAmount);
    // Отримуємо необхідні метадані (наприклад, для nonce) з Wallet Metadata
    const metadata = selectWalletMetadata();

    // Формуємо параметри для відкриття зворотного трейду
    const params = {
      owner: {
        coreSigNonce: metadata.coreSigNonce,
      },
      marginAccountId: accountId,
      amountInBase: partialAmount, // використовуємо частину позиції
      market: {
        baseSpacing: market.baseSpacing,
        counterpartyAccountIds: market.orderInfo.counterpartyAccountIds,
        currentPrice: currentMarkPrice || market.markPrice,
        exchangeId: 4,
        id: market.id,
        minOrderSizeBase: market.minOrderSizeBase,
      },
      tradeSource: "reya",
      // @ts-ignore
      signer: signer as JsonRpcSigner,
    };
    console.log("params", params);
    try {
      console.log("Opening reverse position with params:", params);
      // @ts-ignore
      await crossMarginTradeService(params);

      // @ts-ignore
      useUserStore.getState().updateUserInBackground(rebuildAccount(account));

      addNotification({
        type: "info",
        title: market.ticker,
        subTitle: "Position closed",
        icon: hasIcon(market.quoteToken) ? getIcon(market.quoteToken) : null,
        statusText: "Successful",
        amount: `${partialAmount} ${market.quoteToken}`,
        executionPrice: `${currentMarkPrice} ${market.quoteToken}`,
      });
    } catch (error: any) {
      console.error("Error opening reverse position:", error);
      addNotification({
        title:
          error?.message ||
          error?.response?.data?.message ||
          "Something went wrong",
        type: "error",
        statusText: "// Error",
      });
    }
  }

  return (
    <div className={s.connect}>
      <div className={s.connect__header}>
        <h2 className={s.connect__title}>Close position </h2>
        <p className={s.connect__description}>under {user?.name}</p>
      </div>
      <p className={s.close_text}>
        When closing the position this wll be the etimated resulting PnL.
      </p>
      <CloseInfo>
        <CloseInfoItem
          title={
            <p>
              Position{" "}
              <span
                style={{
                  color:
                    position?.side === "short" ? "var(--red)" : "var(--green)",
                }}
              >
                {position?.side === "short" ? "Short" : "Long"}
              </span>
            </p>
          }
          value={
            <p>
              {position?.sizeFormatted?.value}{" "}
              <span style={{ color: "#6F727E" }}>rUSD</span>
            </p>
          }
        />
        <CloseInfoItem
          title={"Est. PnL"}
          value={
            <p>
              {position?.realisedPnlFormatted?.value}{" "}
              <span style={{ color: "#6F727E" }}>rUSD</span>
            </p>
          }
        />
      </CloseInfo>
      <ClosePosButtons
        amount={amount}
        setAmount={setAmount}
        position={position}
        setClosePercentage={setClosePercentage}
      />

      {!isTradePermissionGranted ? <TradePermission /> : null}
      {!isTradePermissionGrantedForEmbeddedWallet ? (
        <TradePermission onlyWalletPermission />
      ) : null}

      <Button
        variant="primary"
        className={s.action_button}
        disabled={
          !isTradePermissionGranted ||
          !isTradePermissionGrantedForEmbeddedWallet ||
          !signer ||
          !amount
        }
        onClick={async () => {
          if (closePercentage === 100) {
            await closePositionHandler(
              accountId,
              market,
              position,
              false,
              addNotification,
              signer,
              account,
            );
          } else {
            await createNewReversePose();
          }
          onSuccessful();
        }}
      >
        Close
      </Button>
    </div>
  );
};

export const CloseInfo = ({ children, account }: any) => (
  <div className={s.info}>
    {account ? <div className={s.info__account}>{account}</div> : null}
    {children}
  </div>
);

export const CloseInfoItem = ({ title, value }: { title: any; value: any }) => (
  <div className={s.info_item}>
    <div className={s.info_item__title}>{title}</div>
    <div className={s.info_item__value}>{value}</div>
  </div>
);

export default ClosePositionModalComponent;
