"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import Image from "next/image";
import React, { FC, useEffect, useState } from "react";
import { useBalance } from "wagmi";

import { useNotifications } from "@/providers/notifications/useNotifications";
import AccountSelect from "@/shared/components/AccountSelect";
import Block from "@/shared/components/ui/Block";
import { Button } from "@/shared/components/ui/Button/button";
import CustomInput from "@/shared/components/ui/Input";
import CustomSelect from "@/shared/components/ui/Select";
import { useEthersSigner } from "@/shared/hooks/walletUtils";
import useUserStore from "@/shared/store/user.store";
import { getAllowedTokensService } from "@/shared/utils/_common";
import { approveBridge, doDeposit } from "@/shared/utils/reyaConnector";
import { getNetworks, Network } from "@/shared/utils/wnetworks";

import s from "./DepositModal.module.scss";
import {
  getIcon,
  hasIcon,
} from "../../../../../public/assets/icons/coins/avalible_icons";

interface IDepositModal {
  onSuccessfulDeposit: () => void;
}

const DepositModal: FC<IDepositModal> = ({ onSuccessfulDeposit }) => {
  const { primaryWallet, network: currentChain } = useDynamicContext();
  const { user } = useUserStore();
  const networks = getNetworks();
  const { addNotification } = useNotifications();

  const [selectedNetwork, setSelectedNetwork] = useState(
    () => networks.find((network) => network.chainId === currentChain) || null,
  );
  const [usdcAddress, setUsdcAddress] = useState<any>(null);
  const [availableTokens, setAvailableTokens] = useState<any[]>([]);
  const [amount, setAmount] = useState<string>("");
  const [isDepositing, setIsDepositing] = useState<boolean>(false);

  const signer = useEthersSigner({
    chainId: selectedNetwork?.chainId,
  });
  const { data: tokenBalance } = useBalance({
    address: user?.account?.address as `0x${string}` | undefined,
    token: usdcAddress?.address as `0x${string}` | undefined,
    chainId: selectedNetwork?.chainId as number,
  });

  const handleNetworkChange = async (network: { value: Network }) => {
    try {
      if (!primaryWallet) return;
      const params = {
        chainId: network.value.chainId,
      };
      const data = await getAllowedTokensService(params);
      if (data?.tokens) {
        const finalTokens: any = [...data?.tokens];
        setAvailableTokens(finalTokens);
        await primaryWallet.switchNetwork(network.value.chainId);
        setSelectedNetwork(network.value);
        setUsdcAddress(finalTokens?.[0]);
        console.log(`Current chain: ${currentChain}`, finalTokens);
      }
    } catch (error) {
      setUsdcAddress(null);
      setAvailableTokens([]);
      setSelectedNetwork(null);
      console.error("Network switch error:", error);
    }
  };

  const handleTokenChange = (value: any) => {
    setUsdcAddress(value.value);
  };

  useEffect(() => {
    if (!user) return;
    if (!selectedNetwork) return;
    if (!primaryWallet) return;
    if (usdcAddress) return;
    (async () => {
      try {
        const params = {
          chainId: currentChain as number,
        };
        const data = await getAllowedTokensService(params);
        if (data?.tokens) {
          const finalTokens: any = [...data?.tokens];
          setAvailableTokens(finalTokens);
          setUsdcAddress(finalTokens?.[0]);
        }
        console.log(`Current chain: ${currentChain}`, data);
      } catch (error) {
        console.error("Network switch error:", error);
      }
    })();
  }, [user]);

  const handleDeposit = async () => {
    // CHANGED: используем usdcAddress.address, так как теперь usdcAddress – объект
    if (!user || !signer || !usdcAddress || !amount) return;
    setIsDepositing(true);
    try {
      await approveBridge(signer, usdcAddress.address, +amount);
      const depositResult = await doDeposit(
        signer,
        user.id,
        usdcAddress.address,
        selectedNetwork?.chainId as number,
        +amount,
      );

      if (depositResult?.transactionHash) {
        addNotification({
          title: `${usdcAddress?.name} Deposit`,
          type: "success",
          statusText: "Successful",
          amount: `${amount} ${usdcAddress?.name}`,
          icon:
            usdcAddress?.name?.includes("SUSDE") ||
            usdcAddress?.name?.includes("USDC.E")
              ? "/assets/icons/suscdc.svg"
              : "/assets/icons/USD_coin.svg",
        });
        setAmount("");
        onSuccessfulDeposit();
      }
    } catch (error) {
      console.error("___doDeposit Error:", error);
      addNotification({
        // @ts-ignore
        title: `Error: ${error?.message || error || "Deposit failed"}`,
        type: "error",
      });
    } finally {
      setIsDepositing(false);
    }
  };
  const onMaxClick = () => {
    if (tokenBalance?.formatted) {
      setAmount(tokenBalance.formatted);
    }
  };

  function formatName(name: string) {
    return name === "SUSDE" ? "sUSDe" : name === "USDC.E" ? "USDC.e" : name;
  }

  return (
    <Block isLoading={isDepositing} className={s.deposit} opacityLvl={5}>
      <div className={s.deposit__header}>
        <h2 className={s.deposit__title}>Deposit</h2>
      </div>

      <div className={s.network_select}>
        <div className={s.network_select__label}>To account</div>
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
                      icon={selectedNetwork.token}
                      name={selectedNetwork.networkName}
                    />
                  ),
                }
              : null
          }
          onChange={handleNetworkChange}
          isDisabled={isDepositing}
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
              onClick={onMaxClick}
              disabled={isDepositing}
            >
              Max
            </button>
          }
          rightIcon={
            <CustomSelect
              className={s.amount_input__select_label}
              placeholder="Pick Token"
              options={availableTokens.map((token) => ({
                value: token,
                label: formatName(token.name),
              }))}
              value={
                usdcAddress
                  ? {
                      value: usdcAddress,
                      label:
                        usdcAddress?.name?.includes("SUSDE") ||
                        usdcAddress?.name?.includes("USDC.E") ? (
                          <Image
                            src="/assets/icons/suscdc.svg"
                            width={16}
                            height={16}
                            alt="Usd Symbol"
                            className={s.amount_input__icon}
                          />
                        ) : (
                          <Image
                            src="/assets/icons/USD_coin.svg"
                            width={16}
                            height={16}
                            alt="Usd Symbol"
                            className={s.amount_input__icon}
                          />
                        ),
                    }
                  : null
              }
              onChange={handleTokenChange}
              isDisabled={isDepositing}
            />
          }
          disabled={isDepositing}
        />

        <div className={s.deposit__info}>
          <div className={s.amount_input__available}>
            <p>Available</p>
            <div>
              <span className={s.amount_input__available__value}>
                {tokenBalance?.formatted ?? "0.00"}
              </span>{" "}
              {usdcAddress ? formatName(usdcAddress?.name) : ""}
            </div>
          </div>
        </div>
        <InfoItem title="Bridge Fees" value="0.1 USDC" />
        <InfoItem title="Estimated Time" value="5 minutes" />
      </div>

      <Button
        onClick={handleDeposit}
        variant="primary"
        className={s.action_button}
        disabled={isDepositing || !amount || !selectedNetwork}
      >
        {isDepositing ? "Processing..." : "Deposit"}
      </Button>
    </Block>
  );
};

export const NetworkLabel = ({ name, icon }: any) => {
  return (
    <div className={s.network_item}>
      {hasIcon(icon) ? (
        <Image src={getIcon(icon) || ""} alt="icon" width={24} height={24} />
      ) : null}
      {name}
    </div>
  );
};
export const InfoItem = ({
  title,
  value,
}: {
  title: string;
  value: string;
}) => (
  <div className={s.info_item}>
    <div className={s.info_item__title}>{title}</div>
    <div className={s.info_item__value}>{value}</div>
  </div>
);

export default DepositModal;
