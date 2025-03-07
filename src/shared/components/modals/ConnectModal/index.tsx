"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import React, { FC } from "react";

import { Button } from "@/shared/components/ui/Button/button";

import s from "./ConnectModal.module.scss";

interface IConnectModal {
  onSuccessful: () => void;
}

const ConnectModalComponent: FC<IConnectModal> = ({ onSuccessful }) => {
  const { setShowAuthFlow } = useDynamicContext();

  const handleDeposit = async (e: any) => {
    e.preventDefault();
    try {
      onSuccessful();
      setShowAuthFlow(true);
    } catch (error) {
      console.error("___doDeposit Error:", error);
    } finally {
    }
  };

  return (
    <div className={s.connect}>
      <p className={s.text}>
        Connect your wallet to start trading and unlock the full power of Zeuz
      </p>

      <Button
        onClick={handleDeposit}
        variant="primary"
        className={s.action_button}
      >
        Connect
      </Button>
    </div>
  );
};

export default ConnectModalComponent;
