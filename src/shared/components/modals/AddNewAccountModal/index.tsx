"use client";
import { createAccount } from "@reyaxyz/sdk";
import React, { FC, useState } from "react";
import { useAccount, useChainId } from "wagmi";

import { useNotifications } from "@/providers/notifications/useNotifications";
import Block from "@/shared/components/ui/Block";
import { Button } from "@/shared/components/ui/Button/button";
import CustomInput from "@/shared/components/ui/Input";
import Modal from "@/shared/components/ui/Modal";
import { useEthersSigner } from "@/shared/hooks/walletUtils";
import useUserStore from "@/shared/store/user.store";
import { retrieveAccount } from "@/shared/utils/reyaConnector";

import s from "../EditNameModal/EditNameModal.module.scss";

const AddNewAccountModal: FC = () => {
  const { user } = useUserStore();

  const [isOpenCreate, setIsOpenCreate] = useState(false);

  const currentChain = useChainId();
  const [newName, setNewName] = useState("");
  const signer = useEthersSigner({ chainId: currentChain as number });
  const { addNotification } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const account = useAccount();

  const [errors, setErrors] = useState({
    newName: "",
  });

  const handleCreateAccount = async () => {
    if (!user || !signer) return;
    console.log("handleCreateAccount");
    if (errors.newName) {
      console.log("errors.newName");
      addNotification({
        title: "Validation error",
        type: "error",
        statusText: "Please fix input errors before confirming.",
      });
      return;
    }
    setIsEditing(true);

    try {
      console.log("createMainAccount");
      const result = await createAccount({
        ownerAddress: account?.address as string,
        name: newName as string,
      });
      console.log("result", result);
      const updated = await retrieveAccount(
        account?.address as string,
        result?.accountId as number,
      );
      console.log("updated", updated);
      const newAccount = {
        account: user?.account,
        ...updated,
      };
      useUserStore
        .getState()
        // @ts-ignore
        .setUser(newAccount);

      addNotification({
        title: `Account ${newName} created`,
        type: "success",
        statusText: "",
      });
      setIsOpenCreate(false);
      setNewName("");
    } catch (error) {
      console.error("Error renaming margin account", error);
      addNotification({
        title:
          // @ts-ignore
          error?.message ||
          // @ts-ignore
          error?.response?.data?.message ||
          "Something went wrong",
        type: "error",
        statusText: "// Error",
      });
    } finally {
      setIsEditing(false);
    }
  };
  return (
    <>
      <Modal isOpen={isOpenCreate} onClose={() => setIsOpenCreate(false)}>
        <Block isLoading={isEditing} className={s.deposit} opacityLvl={5}>
          <div className={s.deposit__header}>
            <h2 className={s.deposit__title}>Add Account</h2>
          </div>

          <div className={s.amount_input}>
            <CustomInput
              checkMax={false}
              blockMax={false}
              isNumber={false}
              value={newName}
              error={errors.newName}
              onChange={(e) => {
                setErrors({ ...errors, newName: "" });
                setNewName(e.target.value);
              }}
              placeholder="Type account name"
              inputWrapperClassName={s.stop_loss__input}
            />
          </div>
          <Button
            onClick={handleCreateAccount}
            variant="primary"
            className={s.action_button}
            disabled={isEditing || !!errors.newName || !newName || !user}
          >
            {isEditing ? "Processing..." : "Confirm"}
          </Button>
        </Block>
      </Modal>
      <Button
        onClick={() => setIsOpenCreate(true)}
        size="default"
        variant="primary"
        disabled={!user}
        className={s.close_all}
      >
        Add New Account
      </Button>
    </>
  );
};

export default AddNewAccountModal;
