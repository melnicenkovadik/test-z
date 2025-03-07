"use client";
import React, { FC, useState } from "react";
import { useAccount, useChainId } from "wagmi";

import { useNotifications } from "@/providers/notifications/useNotifications";
import {
  EditMarginAccountParams,
  editMarginAccountService,
} from "@/services/margin-account/editMarginAccountService";
import Block from "@/shared/components/ui/Block";
import { Button } from "@/shared/components/ui/Button/button";
import CustomInput from "@/shared/components/ui/Input";
import { rebuildAccount } from "@/shared/hooks/useUserSync";
import { useEthersSigner } from "@/shared/hooks/walletUtils";
import useUserStore from "@/shared/store/user.store";

import s from "./EditNameModal.module.scss";

interface IEditNameModal {
  onSuccessful: () => void;
  data: any;
}

const EditNameModal: FC<IEditNameModal> = ({ onSuccessful, data }) => {
  const { user } = useUserStore();
  const currentChain = useChainId();
  const [newName, setNewName] = useState(data.name);
  const signer = useEthersSigner({ chainId: currentChain as number });
  const { addNotification } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const account = useAccount();

  const [errors, setErrors] = useState({
    newName: "",
  });

  const handleEdit = async () => {
    if (!user || !signer) return;
    if (errors.newName) {
      addNotification({
        title: "Validation error",
        type: "error",
        statusText: "Please fix input errors before confirming.",
      });
      return;
    }
    setIsEditing(true);

    const params: EditMarginAccountParams = {
      id: data.id,
      name: newName,
    };
    console.log("params", params);
    const result = await editMarginAccountService(params);
    console.log("result", result);
    try {
      addNotification({
        title: `${data.name} renamed to ${newName}`,
        type: "success",
        statusText: "",
      });
      useUserStore.getState().updateUserInBackground(
        // @ts-ignore
        rebuildAccount(account),
      );
      onSuccessful();
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
    <Block isLoading={isEditing} className={s.deposit} opacityLvl={5}>
      <div className={s.deposit__header}>
        <h2 className={s.deposit__title}>Rename</h2>
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
          placeholder="New name"
          inputWrapperClassName={s.stop_loss__input}
        />
      </div>
      <Button
        onClick={handleEdit}
        variant="primary"
        className={s.action_button}
        disabled={
          isEditing ||
          !!errors.newName ||
          !newName ||
          newName === data.name ||
          !user
        }
      >
        {isEditing ? "Processing..." : "Confirm"}
      </Button>
    </Block>
  );
};

export default EditNameModal;
