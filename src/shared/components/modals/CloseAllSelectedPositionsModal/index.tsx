"use client";

import React, { FC, useCallback } from "react";
import { useAccount, useChainId } from "wagmi";

import { useNotifications } from "@/providers/notifications/useNotifications";
import {
  CloseInfo,
  CloseInfoItem,
  closePositionHandler,
} from "@/shared/components/modals/ClosePositionModal";
import { Button } from "@/shared/components/ui/Button/button";
import { useEthersSigner } from "@/shared/hooks/walletUtils";
import { refreshWalletMetadata } from "@/shared/store/user.store";

import s from "./ConnectModal.module.scss";

interface ICloseAllSelectedPositionsModal {
  onSuccessful: () => void;
  data: any;
}

const CloseAllSelectedPositionsModalComponent: FC<
  ICloseAllSelectedPositionsModal
> = ({ onSuccessful, data }) => {
  const { addNotification } = useNotifications();
  const account = useAccount();
  const currentChain = useChainId();
  const signer = useEthersSigner({ chainId: currentChain });

  const closeAll = async (rowData: any) => {
    try {
      const positions = rowData.positions;
      if (!positions || positions.length === 0) {
        addNotification({
          title: `Close All for ${rowData?.name}`,
          type: "error",
          statusText: "Error",
        });
        return;
      }

      let failureCount = 0;
      // Проходим по всем позициям и закрываем только те, что открыты
      for (const position of positions) {
        if (position.orderStatus !== "OPEN") continue;

        const success = await closePositionHandler(
          rowData.id,
          position.market,
          position,
          true,
          addNotification,
          signer,
          account,
        );
        if (!success) {
          failureCount++;
        }
      }

      addNotification({
        title: `Close All for ${rowData?.name}`,
        type: failureCount > 0 ? "error" : "info",
        statusText: failureCount ? "Success" : "Error",
      });
    } catch (error: any) {
      console.error("Ошибка при закрытии всех позиций", error);
      addNotification({
        title: `Close All for ${data?.name}`,
        type: "error",
        statusText: "Error",
      });
    } finally {
      await refreshWalletMetadata();
      onSuccessful();
    }
  };

  const handleCloseAllSelected = useCallback(async () => {
    await closeAll(data);
  }, [data]);

  return (
    <div className={s.connect}>
      <div className={s.connect__header}>
        <h2 className={s.connect__title}>Close all position</h2>
      </div>
      <p>When closing all positions this wll be the estimated resulting PnL.</p>
      <CloseInfo>
        {data?.positions
          ? data.positions.map((position: any) => (
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
        onClick={handleCloseAllSelected}
      >
        Close
      </Button>
    </div>
  );
};

export default CloseAllSelectedPositionsModalComponent;
