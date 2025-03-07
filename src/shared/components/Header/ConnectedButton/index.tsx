"use client";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import clsx from "clsx";
import Image from "next/image";
import React from "react";

import { useNotifications } from "@/providers/notifications/useNotifications";
import { Button } from "@/shared/components/ui/Button/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/Popover/Popover";
import useUserStore from "@/shared/store/user.store";
import { shortenString } from "@/shared/utils/numberUtils";

import styles from "./ConnectedButton.module.scss";

const ConnectedButton = ({ className }: any) => {
  const { user, setUser } = useUserStore();
  const context = useDynamicContext();
  if (!context) {
    return null;
  }

  async function logOutHandler() {
    try {
      await context.handleLogOut();
      setUser(null);
    } catch (error) {
      console.error(error);
    }
  }

  const popoverRef = React.useRef(null);
  const closePopover = () => {
    const popover = popoverRef.current;
    if (popover) {
      // @ts-ignore
      popover?.remove();
    }
  };
  const { addNotification } = useNotifications();

  const onCopyAddress = () => {
    if (!user?.account?.address) {
      addNotification({
        title: "No address to copy",
        type: "error",
      });
      return;
    }
    try {
      navigator.clipboard.writeText(user?.account?.address);
      addNotification({
        title: "Address copied to clipboard",
        type: "success",
      });
    } catch {
      addNotification({
        title: "Failed to copy address",
        type: "error",
      });
    }
  };
  return (
    <Popover>
      <PopoverTrigger className={clsx(styles.connected_button, className)}>
        {user?.account?.address
          ? shortenString(user?.account?.address, 3)
          : "..."}
      </PopoverTrigger>
      <PopoverContent
        ref={popoverRef}
        align="end"
        className={styles.connected_content}
      >
        <h3>
          <span>
            Connected with{" "}
            {
              // @ts-ignore
              context?.primaryWallet?._connector?.name ||
                context?.primaryWallet?.key?.toUpperCase()
            }
          </span>
          <Image
            onClick={closePopover}
            width={24}
            height={24}
            src={"assets/icons/markets_close.svg"}
            alt={"icon"}
          />
        </h3>
        <div className={styles.connected_address}>
          <p>
            {" "}
            {user?.account?.address
              ? window.innerWidth > 768
                ? shortenString(user?.account?.address)
                : shortenString(user?.account?.address, 3)
              : "..."}
          </p>
          <Image
            className={styles.copy_icon}
            width={16}
            onClick={onCopyAddress}
            height={16}
            src={"assets/icons/copy.svg"}
            alt={"icon"}
          />
        </div>
        <div className={styles.connected_buttons}>
          <Button
            size={"lg"}
            className={styles.disconnect_button}
            variant={"white"}
            onClick={logOutHandler}
          >
            Disconnect
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ConnectedButton;
