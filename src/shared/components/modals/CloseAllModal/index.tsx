"use client";

import { CloseOrderParams } from "@reyaxyz/sdk";
import React, { FC, useCallback } from "react";
import { useAccount, useChainId } from "wagmi";

import { useNotifications } from "@/providers/notifications/useNotifications";
import { closePositionService } from "@/services/margin-account/closePositionService";
import {
  CloseInfo,
  CloseInfoItem,
} from "@/shared/components/modals/ClosePositionModal";
import { Button } from "@/shared/components/ui/Button/button";
import { useEthersSigner } from "@/shared/hooks/walletUtils";
import { useMarketStore } from "@/shared/store/useMarketStore";
import useUserStore, { selectWalletMetadata } from "@/shared/store/user.store";

import s from "./ConnectModal.module.scss";

interface ICloseAllModal {
  onSuccessful: () => void;
}

const CloseAllModalComponent: FC<ICloseAllModal> = ({ onSuccessful }) => {
  const { accounts, refreshWalletMetadata, updateUserInBackground } =
    useUserStore();
  const { markets } = useMarketStore();

  const { addNotification } = useNotifications();
  const account = useAccount();
  const currentChain = useChainId();
  const signer = useEthersSigner({ chainId: currentChain });

  const handleCloseAll = useCallback(async () => {
    try {
      let totalSuccess = 0;
      let totalFailure = 0;
      // Проходим по всем аккаунтам
      for (const acc of accounts) {
        // Если в аккаунте нет позиций, переходим к следующему
        if (!acc?.positions || acc?.positions?.length === 0) {
          continue;
        }

        // Для каждого аккаунта проходим по позициям
        for (const position of acc.positions) {
          // Закрываем только открытые позиции (например, orderStatus === "OPEN")
          if (position.orderStatus !== "OPEN") continue;
          console.log("position", position);
          // @ts-ignore
          const market = markets.find((m) => m.id === position?.market.id);
          const currentMarkPrice = market?.markPrice;
          const metadata = selectWalletMetadata();
          console.log("market", market);
          const params: CloseOrderParams = {
            marginAccountId: acc.id,
            market: {
              baseSpacing: market?.baseSpacing as number,
              counterpartyAccountIds: market?.orderInfo
                .counterpartyAccountIds as number[],
              currentPrice: currentMarkPrice || (market?.markPrice as number),
              exchangeId: 4,
              id: market?.id as number,
              minOrderSizeBase: market?.minOrderSizeBase as number,
            },
            orderBase: position.base,
            owner: {
              coreSigNonce: metadata.coreSigNonce,
            },
            // @ts-ignore
            signer: signer as JsonRpcSigner,
          };
          console.log("params", params);
          try {
            await closePositionService(params);
            await refreshWalletMetadata();
            totalSuccess++;
          } catch (error: any) {
            console.error("Error closing position for account", acc.id, error);
            totalFailure++;
          }
        }
      }

      addNotification({
        title: "Close All",
        message: `Positions closed: ${totalSuccess}${
          totalFailure ? `, failed to close: ${totalFailure}` : ""
        }`,
        type: totalFailure ? "error" : "info",
        statusText: "// Success",
      });
    } catch (error: any) {
      console.error("Error closing all positions", error);
      addNotification({
        title: "Close All",
        message: "Error closing positions",
        type: "error",
        statusText: "// Error",
      });
    } finally {
      onSuccessful();
    }
  }, [
    accounts,
    addNotification,
    refreshWalletMetadata,
    updateUserInBackground,
    account,
    signer,
    currentChain,
  ]);
  return (
    <div className={s.connect}>
      <div className={s.connect__header}>
        <h2 className={s.connect__title}>Close all</h2>
        <p className={s.connect__description}>under all accounts</p>
      </div>
      <p>When closing all positions this wll be the estimated resulting PnL.</p>
      {accounts.map((acc) => {
        if (!acc?.positions || acc?.positions?.length === 0) {
          return null;
        }
        return (
          <CloseInfo account={acc?.name}>
            {acc?.positions.map((position: any) => {
              return (
                <>
                  <CloseInfoItem
                    title={
                      <p>
                        {position?.market?.ticker}{" "}
                        <span
                          style={{
                            color:
                              position?.side === "short"
                                ? "var(--red)"
                                : "var(--green)",
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
                </>
              );
            })}
          </CloseInfo>
        );
      })}
      <Button
        variant="primary"
        className={s.action_button}
        onClick={handleCloseAll}
      >
        Close
      </Button>
    </div>
  );
};

export default CloseAllModalComponent;
