import { TokenEntity } from "@reyaxyz/common";
import { TransferMarginBetweenAccountsParams } from "@reyaxyz/sdk";
import React, { FC, useState } from "react";
import { useAccount, useChainId } from "wagmi";

import { useNotifications } from "@/providers/notifications/useNotifications";
import { armSimulateTransferBetweenMarginAccountService } from "@/services/margin-account-transfer-flow/armSimulateTransferBetweenMarginAccountService";
import { transferBetweenMarginAccountService } from "@/services/margin-account-transfer-flow/transferBetweenMarginAccountService";
import s from "@/shared/components/modals/TransferModal/TransferModal.module.scss";
import { Button } from "@/shared/components/ui/Button/button";
import { rebuildAccount } from "@/shared/hooks/useUserSync";
import { useEthersSigner } from "@/shared/hooks/walletUtils";
import useUserStore from "@/shared/store/user.store";

interface MarginAccount {
  id: number;
  totalPositionsCount: number;
  totalBalance: number; // или BigNumber — в зависимости от того, что реально возвращает бэкенд
}

interface ITransferFromAllAccounts {
  isTransfering: boolean;
  setIsTransfering: (isTransfering: boolean) => void;
  onSuccessful: () => void;
  disabled?: boolean;
  to: any;
}

const TransferFromAllAccounts: FC<ITransferFromAllAccounts> = ({
  isTransfering,
  setIsTransfering,
  onSuccessful,
  disabled,
  to,
}) => {
  const { accounts, ownerMetadata, updateUserInBackground } = useUserStore();
  console.log("to", to);
  const account = useAccount();
  const currentChain = useChainId();
  const signer = useEthersSigner({ chainId: currentChain as number });
  const { addNotification } = useNotifications();

  const [usdcAddress] = useState<TokenEntity["address"] | null>(
    "0xa9f32a851b1800742e47725da54a09a7ef2556a3",
  );

  const handleTransfer = async () => {
    if (!to || !signer || !usdcAddress) return;

    setIsTransfering(true);

    try {
      // @ts-ignore
      const constructedParams: TransferMarginBetweenAccountsParams[] = (
        accounts as MarginAccount[]
      )
        .filter(
          (acc) =>
            acc.id !== to.id &&
            acc.totalPositionsCount === 0 &&
            // @ts-ignore
            acc?.totalBalanceFormatted?.value !== "0",
        )
        .map((acc, index) => {
          // @ts-ignore
          const amountForSdk = acc?.totalBalanceFormatted?.value;
          if (amountForSdk === "0" || +amountForSdk - 0.001 <= 0) {
            return null;
          } else {
            return {
              signer,
              owner: {
                coreSigNonce: (ownerMetadata?.coreSigNonce ?? 0) + index,
              },
              fromMarginAccountId: acc.id,
              toMarginAccountId: to.id,
              tokenAddress: usdcAddress,
              amount: +amountForSdk - 0.001,
            };
          }
        })
        .filter(Boolean) as TransferMarginBetweenAccountsParams[];
      console.log("constructedParams", constructedParams);
      const simulateResults = await Promise.all(
        constructedParams.map(async (params) => {
          await armSimulateTransferBetweenMarginAccountService(params);
          return {
            fromMarginAccountId: params.fromMarginAccountId,
            toMarginAccountId: params.toMarginAccountId,
          };
        }),
      );
      console.log("simulateResults", simulateResults);
      if (simulateResults.length !== constructedParams.length) {
        console.error("Transfer simulation failed");
      } else {
        for (const params of constructedParams) {
          try {
            await transferBetweenMarginAccountService(params);
          } catch (error) {
            // need to handle coreSigNonce for each account
            console.error("Transfer error:", error);
          }
        }
      }

      addNotification({
        title: "Transfer From All Accounts",
        type: "success",
        statusText: "Successful",
      });

      onSuccessful?.();
      // Если нужно обновить юзера в фоне:
      // updateUserInBackground();
    } catch (error) {
      console.error("Transfer error:", error);

      addNotification({
        title: "Transfer Failed",
        type: "error",
        statusText: "Transaction failed",
      });
    } finally {
      setIsTransfering(false);

      // @ts-ignore
      updateUserInBackground(rebuildAccount(account as unknown as Account));
    }
  };

  return (
    <Button
      onClick={handleTransfer}
      variant="primary"
      className={s.action_button}
      disabled={!to || isTransfering || disabled}
    >
      {isTransfering ? "Processing..." : "Transfer"}
    </Button>
  );
};

export default TransferFromAllAccounts;
