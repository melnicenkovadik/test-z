"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { ApiClient } from "@reyaxyz/api-sdk";
import Image from "next/image";
import React, { FC, useEffect, useState } from "react";

import { useNotifications } from "@/providers/notifications/useNotifications";
import AccountSelect from "@/shared/components/AccountSelect";
import { NetworkLabel } from "@/shared/components/modals/DepositModal";
import Block from "@/shared/components/ui/Block";
import { Button } from "@/shared/components/ui/Button/button";
import CustomInput from "@/shared/components/ui/Input";
import CustomSelect from "@/shared/components/ui/Select";
import { useEthersSigner } from "@/shared/hooks/walletUtils";
import useUserStore from "@/shared/store/user.store";
import { getMarginAccountWithdrawBalanceService } from "@/shared/utils/_common";
import { doWithdraw, getOwnerMetadata } from "@/shared/utils/reyaConnector";
import { priceFormatter } from "@/shared/utils/ui-minions";
import { getNetworks, Network } from "@/shared/utils/wnetworks";

import s from "../DepositModal/DepositModal.module.scss";

interface IWithdrawModal {
  onSuccessfulWithdraw: () => void;
}

const WithdrawModal: FC<IWithdrawModal> = ({ onSuccessfulWithdraw }) => {
  const { primaryWallet, network: currentChain } = useDynamicContext();
  const { user } = useUserStore();
  const networks = getNetworks();
  const { addNotification } = useNotifications();

  const [avalibleForWithdraw, setAvalibleForWithdraw] = useState<number>(0);
  const [amount, setAmount] = useState<string>("");
  const [usdcAddress, setUsdcAddress] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [inputError, setInputError] = useState<string>("");

  const [minWithdrawAmount, setMinWithdrawAmount] = useState<number>(Infinity);
  const tokenId = "0xa9F32a851B1800742e47725DA54a09A7Ef2556A3";

  useEffect(() => {
    getMarginAccountWithdrawBalanceService({
      marginAccountId: user?.id as number,
      tokenAddress: tokenId,
    }).then((res) => {
      setAvalibleForWithdraw(res);
    });
  }, [user, tokenId]);

  const [selectedNetwork, setSelectedNetwork] = useState(
    () => networks.find((network) => network.chainId === currentChain) || null,
  );

  const signer = useEthersSigner({
    chainId: selectedNetwork?.chainId,
  });

  useEffect(() => {
    const chainData = networks.find(
      (network) => network.chainId === selectedNetwork?.chainId,
    );
    if (chainData) setUsdcAddress(chainData.usdcAddress);
  }, [selectedNetwork, networks]);

  const getMinWithdrawAmount = (
    config: any,
    chainId: number | string,
    tokenId: string,
  ): number => {
    if (!tokenId || !chainId) return -Infinity;
    if (!config) return Infinity;
    const tokenConfig = config["RUSD"];
    if (!tokenConfig) return Infinity;
    const minWithdrawAmountConfig = tokenConfig[chainId];
    if (!minWithdrawAmountConfig) return Infinity;
    const minWithdraw = minWithdrawAmountConfig.minWithdrawAmount;
    const min = minWithdraw === 10 ? 1 : minWithdraw === 78 ? 1 : minWithdraw;
    return min == null || min === "" ? Infinity : min;
  };

  useEffect(() => {
    async function fetchMinWithdrawConfig() {
      try {
        const config =
          await ApiClient.tokens.getMoneyInOutConfigurationPerTokenName();
        const computedMin = getMinWithdrawAmount(
          config,
          // @ts-ignore
          selectedNetwork?.chainId,
          tokenId,
        );
        setMinWithdrawAmount(computedMin);
      } catch (error) {
        console.error("Error fetching configuration", error);
      }
    }

    if (selectedNetwork) {
      fetchMinWithdrawConfig();
    }
  }, [selectedNetwork, tokenId]);

  useEffect(() => {
    const value = parseFloat(amount);
    if (
      !isNaN(value) &&
      isFinite(minWithdrawAmount) &&
      value > 0 &&
      value < minWithdrawAmount
    ) {
      setInputError(`Minimum withdrawal amount is ${minWithdrawAmount}`);
    } else {
      setInputError("");
    }
  }, [amount, minWithdrawAmount]);

  const handleNetworkChange = async (network: { value: Network }) => {
    try {
      if (!primaryWallet) return;
      await primaryWallet.switchNetwork(network.value.chainId);
      setSelectedNetwork(network.value);
    } catch (error) {
      console.error("Network switch error:", error);
    }
  };

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount < minWithdrawAmount) {
      setInputError(`Minimum withdrawal amount is ${minWithdrawAmount}`);
      return;
    }
    if (!user || !signer || !usdcAddress || !amount || !selectedNetwork) return;

    setIsWithdrawing(true);
    try {
      const ownerMetadata = await getOwnerMetadata(
        primaryWallet?.address as string,
      );
      const errorCb = (error: any) => {
        const errorText = error?.message ? error.message : String(error);
        console.error("Withdraw error callback details:", errorText);
        addNotification({
          title: `Error: ${errorText}`,
          type: "error",
        });
      };

      const withdrawResult = await doWithdraw(
        signer,
        user.id,
        primaryWallet?.address as string,
        usdcAddress,
        withdrawAmount,
        selectedNetwork.chainId,
        ownerMetadata.coreSigNonce,
        errorCb,
      );

      if (withdrawResult?.transactionHash) {
        addNotification({
          title: `USDC.e Withdraw`,
          type: "success",
          statusText: "Successful",
          amount: `${amount} USDC.e`,
          icon: "/assets/icons/USD_coin.svg",
        });
        setAmount("");
        onSuccessfulWithdraw();
      }
    } catch (error) {
      // @ts-ignore
      console.error("Withdraw error:", error?.message);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <Block isLoading={isWithdrawing} className={s.deposit} opacityLvl={5}>
      <div className={s.deposit__header}>
        <h2 className={s.deposit__title}>Withdraw</h2>
        {/*<p className={s.deposit__description}>To {user?.name}</p>*/}
      </div>

      <div className={s.network_select}>
        <div className={s.network_select__label}>From account</div>
        <AccountSelect
          classname={s.acc_classname}
          selectClassName={s.acc_select_class_name}
          selectContentClassName={s.acc_select_content_class_name}
          selectLabelClassName={s.acc_select_label_class_name}
        />
      </div>
      <div className={s.network_select}>
        <div className={s.network_select__label}>Choose network</div>
        <CustomSelect
          placeholder="Pick Network"
          options={networks.map((network) => ({
            value: network,
            label: (
              <NetworkLabel name={network.networkName} icon={network.token} />
            ),
          }))}
          value={
            selectedNetwork
              ? {
                  value: selectedNetwork,
                  label: (
                    <NetworkLabel
                      name={selectedNetwork.networkName}
                      icon={selectedNetwork.token}
                    />
                  ),
                }
              : null
          }
          onChange={handleNetworkChange}
          isDisabled={isWithdrawing}
        />
      </div>

      <div className={s.amount_input}>
        <div className={s.amount_input__label}>Amount</div>
        <CustomInput
          value={amount}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d*\.?\d*$/.test(value)) setAmount(value);
          }}
          onInput={(e) => {
            const value = e.currentTarget.value;
            const regExp = /^0[0-9]/;
            const regExp2 = /^0{2,}/;
            if (regExp.test(value)) {
              e.currentTarget.value = value.replace(/^0/, "");
            } else if (regExp2.test(value)) {
              e.currentTarget.value = value.replace(/^0{2,}/, "0");
            } else {
              e.currentTarget.value = value;
            }
          }}
          placeholder="Enter Amount"
          customButton={
            <button
              className={s.amount_input__max}
              onClick={() => setAmount(String(avalibleForWithdraw))}
              disabled={isWithdrawing}
            >
              Max
            </button>
          }
          rightIcon={
            <Image
              src="/assets/icons/USD_coin.svg"
              width={16}
              height={16}
              alt="Usd Symbol"
              className={s.amount_input__icon}
            />
          }
          error={inputError}
          disabled={isWithdrawing}
          max={avalibleForWithdraw}
        />
      </div>

      <div className={s.deposit__info}>
        <div className={s.amount_input__available}>
          <p>Available for withdraw</p>
          <div>
            <span className={s.amount_input__available__value}>
              {priceFormatter(avalibleForWithdraw, {
                locale: "en-US",
                precision: 6,
              })}
            </span>{" "}
            USDC.e
          </div>
        </div>
        <InfoItem title="Bridge Fees" value="0.1 USDC.e" />
        <InfoItem title="Estimated Time" value="5 minutes" />
      </div>

      <Button
        onClick={handleWithdraw}
        variant="primary"
        className={s.action_button}
        disabled={isWithdrawing || !!inputError || !amount || !selectedNetwork}
      >
        {isWithdrawing ? "Processing..." : "Withdraw"}
      </Button>
    </Block>
  );
};

const InfoItem = ({ title, value }: { title: string; value: any }) => (
  <div className={s.info_item}>
    <div className={s.info_item__title}>{title}</div>
    <div className={s.info_item__value}>{value}</div>
  </div>
);

export default WithdrawModal;
