"use client";
import { TransferMarginBetweenMAsSimulationLoadDataParams } from "@reyaxyz/api-sdk";
import { TokenEntity } from "@reyaxyz/common";
import { TransferMarginBetweenAccountsParams } from "@reyaxyz/sdk";
import React, { FC, useEffect, useState } from "react";
import { Account } from "viem";
import { useAccount, useChainId } from "wagmi";

import { useNotifications } from "@/providers/notifications/useNotifications";
import { armSimulateTransferBetweenMarginAccountService } from "@/services/margin-account-transfer-flow/armSimulateTransferBetweenMarginAccountService";
import { transferBetweenMarginAccountService } from "@/services/margin-account-transfer-flow/transferBetweenMarginAccountService";
import AccountSelect, { AccountLabel } from "@/shared/components/AccountSelect";
import TransferFromAllAccounts from "@/shared/components/DevMenu/components/TransferFromAllAccounts";
import Block from "@/shared/components/ui/Block";
import { Button } from "@/shared/components/ui/Button/button";
import CustomInput from "@/shared/components/ui/Input";
import CustomSelect from "@/shared/components/ui/Select";
import { rebuildAccount } from "@/shared/hooks/useUserSync";
import { useEthersSigner } from "@/shared/hooks/walletUtils";
import useUserStore, { UserExtended } from "@/shared/store/user.store";
import { getMarginAccountWithdrawBalanceService } from "@/shared/utils/_common";
import { priceFormatter } from "@/shared/utils/ui-minions";

import s from "./TransferModal.module.scss";

interface ITransferModal {
  onSuccessful: () => void;
}

const TransferModal: FC<ITransferModal> = ({ onSuccessful }) => {
  const { accounts, user, ownerMetadata, updateUserInBackground } =
    useUserStore();
  const account = useAccount();
  const [allOption, setAllOption] = useState(false);
  console.log("allOption", allOption);
  const currentChain = useChainId();
  const signer = useEthersSigner({ chainId: currentChain as number });
  const { addNotification } = useNotifications();
  const [avalibleForTransfer, setAvalibleForTransfer] = useState<number>(0);

  const [targetAccount, setTargetAccount] = useState<UserExtended>(null);
  const [amount, setAmount] = useState<string>("");
  const [usdcAddress] = useState<string | null>(
    "0xa9f32a851b1800742e47725da54a09a7ef2556a3",
  );
  const [isTransfering, setIsTransfering] = useState(false);

  useEffect(() => {
    getMarginAccountWithdrawBalanceService({
      marginAccountId: user?.id as number,
      tokenAddress: "0xa9F32a851B1800742e47725DA54a09A7Ef2556A3",
    }).then((res) => {
      setAvalibleForTransfer(+res - 0.0001);
    });
  }, [user?.id]);

  const handleTargetAccountChange = async (account: {
    value: UserExtended;
  }) => {
    try {
      setTargetAccount(account.value);
    } catch (error) {
      console.error("Network switch error:", error);
    }
  };

  useEffect(() => {
    if (!user || !targetAccount) return;

    const simulateParams: TransferMarginBetweenMAsSimulationLoadDataParams = {
      fromMarginAccountId: user.id,
      toMarginAccountId: targetAccount.id,
    };

    armSimulateTransferBetweenMarginAccountService(simulateParams);
  }, [targetAccount?.id, user?.id]);

  const handleTransfer = async () => {
    if (!user || !signer || !usdcAddress || !amount || !targetAccount) return;

    setIsTransfering(true);
    try {
      const params: TransferMarginBetweenAccountsParams = {
        // @ts-ignore
        signer: signer,
        owner: {
          coreSigNonce: ownerMetadata.coreSigNonce,
        },
        fromMarginAccountId: user.id,
        toMarginAccountId: targetAccount.id,
        tokenAddress: usdcAddress as TokenEntity["address"],
        amount: +amount as number,
      };
      await transferBetweenMarginAccountService(params);
      addNotification({
        title: "rUSD Transfer",
        type: "success",
        statusText: "Successful",
        amount: `${amount} rUSD`,
        icon: "/assets/icons/USD_coin.svg",
      });
      setAmount("");
      onSuccessful();

      // @ts-ignore
      updateUserInBackground(rebuildAccount(account as unknown as Account));
    } catch (error) {
      console.error("Transfer error:", error);
      addNotification({
        title: "Transfer Failed",
        type: "error",
        statusText: "Transaction failed",
      });
    } finally {
      setIsTransfering(false);
    }
  };

  return (
    <Block isLoading={isTransfering} className={s.deposit} opacityLvl={5}>
      <div className={s.deposit__header}>
        <h2 className={s.deposit__title}>Transfer</h2>
        {/*<p className={s.deposit__description}>From {user?.name}</p>*/}
      </div>

      <div className={s.network_select}>
        <div className={s.network_select__label}>From account</div>
        <AccountSelect
          classname={s.acc_classname}
          selectClassName={s.acc_select_class_name}
          selectContentClassName={s.acc_select_content_class_name}
          selectLabelClassName={s.acc_select_label_class_name}
          withBalance={true}
          withAllOption={{
            set: setAllOption,
            isSelected: allOption,
          }}
        />
      </div>
      <div className={s.network_select}>
        <div className={s.network_select__label}>
          Choose account to transfer
        </div>
        <CustomSelect
          placeholder="Transfer to"
          options={accounts
            .filter((account) => account && account.id !== user?.id)
            .map((account: any) => ({
              value: account,
              label: (
                <AccountLabel
                  totalPositionsCount={account?.totalPositionsCount}
                  name={account?.name as string}
                  balance={account?.totalBalanceFormatted.value}
                />
              ),
            }))}
          value={
            targetAccount
              ? {
                  value: targetAccount,
                  label: (
                    <AccountLabel
                      totalPositionsCount={targetAccount?.totalPositionsCount}
                      name={targetAccount?.name as string}
                      balance={targetAccount?.totalBalanceFormatted.value}
                    />
                  ),
                }
              : null
          }
          onChange={handleTargetAccountChange}
          isDisabled={isTransfering}
        />
      </div>

      {!allOption ? (
        <div className={s.amount_input}>
          <div className={s.amount_input__label}>Amount</div>
          <CustomInput
            rightIcon={
              <div
                onClick={() => setAmount(avalibleForTransfer?.toString() || "")}
                className={s.amount_input__max}
              >
                Max
              </div>
            }
            value={amount}
            isNumber
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter Amount"
            disabled={isTransfering || !targetAccount}
            max={(targetAccount && targetAccount.totalBalance) || 0}
            min={0.01}
          />
          <div className={s.amount_input__available}>
            <p>Available for transfer</p>
            <div>
              <span className={s.amount_input__available__value}>
                {priceFormatter(avalibleForTransfer, {
                  locale: "en-US",
                  precision: 6,
                })}
              </span>{" "}
              rUSD
            </div>
          </div>
        </div>
      ) : null}

      <div className={s.action_buttons}>
        {allOption ? (
          <TransferFromAllAccounts
            isTransfering={isTransfering}
            setIsTransfering={setIsTransfering}
            onSuccessful={onSuccessful}
            disabled={isTransfering}
            to={targetAccount}
          />
        ) : (
          <Button
            onClick={handleTransfer}
            variant="primary"
            className={s.action_button}
            disabled={
              !targetAccount ||
              !amount ||
              +amount > avalibleForTransfer ||
              isTransfering
            }
          >
            {isTransfering ? "Processing..." : "Transfer"}
          </Button>
        )}
      </div>
    </Block>
  );
};

export default TransferModal;
