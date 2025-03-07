"use client";
import Image from "next/image";
import { useCallback, useState } from "react";

import DepositModal from "@/shared/components/modals/DepositModal";
import TransferModal from "@/shared/components/modals/TransferModal";
import WithdrawModal from "@/shared/components/modals/WithdrawModal";
import Block from "@/shared/components/ui/Block";
import { Button } from "@/shared/components/ui/Button/button";
import { useRequireAuthFlow } from "@/shared/hooks/useRequireAuthFlow";

import styles from "./Controls.module.scss";
import Modal from "../../../shared/components/ui/Modal";

export const Controls = () => {
  const [isOpenDepositModal, setIsOpenDepositModal] = useState(false);
  const [isOpenWithdrawModal, setIsOpenWithdrawModal] = useState(false);
  const [isOpenTransferModal, setIsOpenTransferModal] = useState(false);
  const { requireAuth, ConnectModal } = useRequireAuthFlow({
    showCustomModal: true,
  });

  const handleDepositModalOpen = useCallback(() => {
    if (requireAuth()) {
      return false;
    } else {
      return setIsOpenDepositModal(true);
    }
  }, [requireAuth]);

  const handleWithdrawModalOpen = useCallback(() => {
    if (requireAuth()) {
      return false;
    } else {
      return setIsOpenWithdrawModal(true);
    }
  }, [requireAuth]);

  const handleTransferModalOpen = useCallback(() => {
    if (requireAuth()) {
      return false;
    } else {
      return setIsOpenTransferModal(true);
    }
  }, [requireAuth]);

  function onSuccessfulDepositHandler() {
    setIsOpenDepositModal(false);
  }

  function onSuccessfulWithdrawHandler() {
    setIsOpenWithdrawModal(false);
  }

  function onSuccessfulTransferHandler() {
    setIsOpenTransferModal(false);
  }

  return (
    <Block className={styles.container}>
      <ConnectModal />
      <Modal
        isOpen={isOpenDepositModal}
        onClose={() => setIsOpenDepositModal(false)}
      >
        <DepositModal onSuccessfulDeposit={onSuccessfulDepositHandler} />
      </Modal>

      <Modal
        isOpen={isOpenWithdrawModal}
        onClose={() => setIsOpenWithdrawModal(false)}
      >
        <WithdrawModal onSuccessfulWithdraw={onSuccessfulWithdrawHandler} />
      </Modal>
      <Modal
        isOpen={isOpenTransferModal}
        onClose={() => setIsOpenTransferModal(false)}
      >
        <TransferModal onSuccessful={onSuccessfulTransferHandler} />
      </Modal>
      <Button
        onClick={handleDepositModalOpen}
        size={"default"}
        variant={"primary"}
        className={styles.button}
      >
        <Image
          src={"/assets/icons/deposit_icon.svg"}
          alt={"Deposit"}
          width={20}
          height={20}
        />
        Deposit
      </Button>
      <Button
        onClick={handleWithdrawModalOpen}
        size={"default"}
        variant={"primary"}
        className={styles.button}
      >
        <Image
          src={"/assets/icons/withdraw_icon.svg"}
          alt={"Withdraw"}
          width={20}
          height={20}
        />
        Withdraw
      </Button>
      <Button
        onClick={handleTransferModalOpen}
        size={"default"}
        variant={"primary"}
        className={styles.button}
      >
        <Image
          src={"/assets/icons/transfer_icon.svg"}
          alt={"Withdraw"}
          width={20}
          height={20}
        />
        Transfer
      </Button>
    </Block>
  );
};
