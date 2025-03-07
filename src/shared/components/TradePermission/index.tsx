"use client";
import { useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import React, { useEffect } from "react";

import { useNotifications } from "@/providers/notifications/useNotifications";
import { useGrantConditionalOrdersPermissionEmbeddedWalletMutation } from "@/shared/components/TradePermission/useGrantConditionalOrdersPermissionEmbeddedWalletMutation";
import {
  useGrantConditionalOrdersPermissionMutation,
  useRevokeConditionalOrdersPermissionMutation,
  useRevokeConditionalOrdersPermissionEmbeddedWalletMutation,
} from "@/shared/components/TradePermission/useGrantConditionalOrdersPermissionMutation";
import { Button } from "@/shared/components/ui/Button/button";
import useUserStore from "@/shared/store/user.store";

import s from "./trade-permission.module.scss";

interface TradePermissionProps {
  onlyWalletPermission?: boolean;
}

const TradePermission: React.FC<TradePermissionProps> = ({
  onlyWalletPermission = false,
}) => {
  const { user } = useUserStore();
  const marginAccountId = user?.id;
  const isLoggedIn = useIsLoggedIn();
  // Хуки для выдачи разрешения
  const {
    grantPermissionError,
    grantTradePermission,
    isGrantTradePermissionLoading,
    isTradePermissionGranted,
    checkIsConditionalOrdersPermissionGranted,
  } = useGrantConditionalOrdersPermissionMutation(marginAccountId);

  const {
    grantPermissionErrorForEmbeddedWallet,
    grantTradePermission: grantTradePermissionEmbeddedWallet,
    isGrantTradePermissionLoadingForEmbeddedWallet,
    isTradePermissionGrantedForEmbeddedWallet,
    checkIsConditionalOrdersPermissionGrantedToEmbeddedWallet,
  } = useGrantConditionalOrdersPermissionEmbeddedWalletMutation(
    marginAccountId,
  );

  // Хуки для отзыва разрешения
  const {
    revokePermissionError,
    revokeTradePermission,
    isRevokeTradePermissionLoading,
  } = useRevokeConditionalOrdersPermissionMutation(marginAccountId);

  const {
    revokePermissionErrorForEmbeddedWallet,
    revokeTradePermission: revokeTradePermissionEmbeddedWallet,
    isRevokeTradePermissionLoadingForEmbeddedWallet,
  } = useRevokeConditionalOrdersPermissionEmbeddedWalletMutation(
    marginAccountId,
  );

  // Определяем актуальные значения в зависимости от режима
  const currentIsTradePermissionGranted = onlyWalletPermission
    ? isTradePermissionGrantedForEmbeddedWallet
    : isTradePermissionGranted;

  const currentIsGrantTradePermissionLoading = onlyWalletPermission
    ? isGrantTradePermissionLoadingForEmbeddedWallet
    : isGrantTradePermissionLoading;

  const currentGrantPermissionError = onlyWalletPermission
    ? grantPermissionErrorForEmbeddedWallet
    : grantPermissionError;

  const currentIsRevokeTradePermissionLoading = onlyWalletPermission
    ? isRevokeTradePermissionLoadingForEmbeddedWallet
    : isRevokeTradePermissionLoading;

  const currentRevokePermissionError = onlyWalletPermission
    ? revokePermissionErrorForEmbeddedWallet
    : revokePermissionError;

  const { addNotification } = useNotifications();

  useEffect(() => {
    if (marginAccountId) {
      if (onlyWalletPermission) {
        void checkIsConditionalOrdersPermissionGrantedToEmbeddedWallet();
      } else {
        void checkIsConditionalOrdersPermissionGranted();
      }
    }
  }, [
    marginAccountId,
    onlyWalletPermission,
    checkIsConditionalOrdersPermissionGranted,
    checkIsConditionalOrdersPermissionGrantedToEmbeddedWallet,
  ]);

  useEffect(() => {
    if (currentGrantPermissionError) {
      addNotification({
        title:
          currentGrantPermissionError.message || "Error granting permission",
        type: "error",
        statusText: "// Error",
      });
    }
    if (currentRevokePermissionError) {
      addNotification({
        title:
          currentRevokePermissionError.message || "Error revoking permission",
        type: "error",
        statusText: "// Error",
      });
    }
  }, [
    currentGrantPermissionError,
    currentRevokePermissionError,
    addNotification,
  ]);

  const handleGrantClick = () => {
    if (onlyWalletPermission) {
      grantTradePermissionEmbeddedWallet();
    } else {
      grantTradePermission();
    }
  };

  const handleRevokeClick = () => {
    if (onlyWalletPermission) {
      revokeTradePermissionEmbeddedWallet();
    } else {
      revokeTradePermission();
    }
  };

  if (!isLoggedIn || !marginAccountId || !user) {
    return null;
  }
  return (
    <div className={s.trade_permission_container}>
      {/** Если права отсутствуют и нет загрузки - показываем кнопку выдачи прав */}
      {!currentIsTradePermissionGranted &&
        !currentIsGrantTradePermissionLoading && (
          <Button
            className={s.give_permission_button}
            onClick={handleGrantClick}
            disabled={
              currentIsGrantTradePermissionLoading ||
              currentIsTradePermissionGranted
            }
          >
            Grant Permission{" "}
            {onlyWalletPermission ? "for Wallet" : "for Trading"}
          </Button>
        )}
      {/** Если права есть и нет загрузки - показываем кнопку для их отзыва */}
      {currentIsTradePermissionGranted &&
        !currentIsRevokeTradePermissionLoading && (
          <Button
            className={s.revoke_permission_button}
            onClick={handleRevokeClick}
            disabled={currentIsRevokeTradePermissionLoading}
          >
            Revoke Permission{" "}
            {onlyWalletPermission ? "for Wallet" : "for Trading"}
          </Button>
        )}
    </div>
  );
};

export default TradePermission;
