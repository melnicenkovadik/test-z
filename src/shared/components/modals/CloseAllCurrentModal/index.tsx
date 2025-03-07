"use client";

import { CloseOrderParams } from "@reyaxyz/sdk";
import React, { FC, useCallback } from "react";
import { useChainId } from "wagmi";

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

interface ICloseAllCurrentModal {
  onSuccessful: () => void;
}

const CloseAllCurrentModalComponent: FC<ICloseAllCurrentModal> = ({
  onSuccessful,
}) => {
  // Получаем текущий аккаунт и метод обновления metadata
  const { user, refreshWalletMetadata } = useUserStore();
  const { markets } = useMarketStore();
  const { addNotification } = useNotifications();
  const currentChain = useChainId();
  const signer = useEthersSigner({ chainId: currentChain });

  const handleCloseAllCurrent = useCallback(async () => {
    try {
      let totalFailure = 0;

      // Если текущий аккаунт отсутствует или у него нет позиций, выводим уведомление
      if (!user || !user.positions || user.positions.length === 0) {
        addNotification({
          title: `Close All for ${user?.name}`,
          type: "error",
          statusText: "Error",
        });
        return;
      }

      // Проходим по всем позициям текущего аккаунта
      for (const position of user.positions) {
        // Закрываем только открытые позиции
        if (position.orderStatus !== "OPEN") continue;

        // Ищем данные рынка для позиции
        // @ts-ignore
        const market = markets.find((m) => m.id === position?.market.id);
        if (!market) continue;

        const currentMarkPrice = market.markPrice;
        const metadata = selectWalletMetadata();

        const params: CloseOrderParams = {
          marginAccountId: user.id,
          market: {
            baseSpacing: market.baseSpacing as number,
            counterpartyAccountIds: market.orderInfo
              .counterpartyAccountIds as number[],
            currentPrice: currentMarkPrice || (market.markPrice as number),
            exchangeId: 4,
            id: market.id as number,
            minOrderSizeBase: market.minOrderSizeBase as number,
          },
          orderBase: position.base,
          owner: {
            coreSigNonce: metadata.coreSigNonce,
          },
          // @ts-ignore
          signer: signer as JsonRpcSigner,
        };

        try {
          await closePositionService(params);
          await refreshWalletMetadata();
        } catch (error: any) {
          console.error(
            "Ошибка при закрытии позиции для текущего аккаунта",
            user.id,
            error,
          );
          totalFailure++;
        }
      }

      addNotification({
        title: `Close All for ${user?.name}`,
        type: totalFailure ? "error" : "info",
        statusText: totalFailure ? "Error" : "Success",
      });
    } catch (error: any) {
      console.error("Ошибка при закрытии всех позиций", error);
      addNotification({
        title: `Close All for ${user?.name}`,
        type: "error",
        statusText: "Error",
      });
    } finally {
      onSuccessful();
    }
  }, [
    user,
    markets,
    signer,
    refreshWalletMetadata,
    addNotification,
    currentChain,
  ]);
  console.log("user?.positions", user?.positions);
  return (
    <div className={s.connect}>
      <div className={s.connect__header}>
        <h2 className={s.connect__title}>Close all</h2>
        <p className={s.connect__description}>under {user?.name}</p>
      </div>
      <p>When closing all positions this wll be the estimated resulting PnL.</p>
      <CloseInfo>
        {user?.positions
          ? user?.positions.map((position: any) => (
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
            ))
          : null}
      </CloseInfo>
      <Button
        variant="primary"
        className={s.action_button}
        onClick={handleCloseAllCurrent}
      >
        Close
      </Button>
    </div>
  );
};

export default CloseAllCurrentModalComponent;
