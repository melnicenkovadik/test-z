"use client";
import AccountManager from "@/shared/components/AccountManager";
import Block from "@/shared/components/ui/Block";
import { Typography } from "@/shared/components/ui/Typography";
import userStore from "@/shared/store/user.store";

import styles from "./AccountInfo.module.scss";

export const AccountInfo = () => {
  const { user } = userStore();
  const dayChange: string = !!+user?.balanceChange24HPercentageFormatted
    ? user?.balanceChange24HPercentageFormatted
    : "0";
  const realizedPnl = !!+user?.realizedPNLFormatted?.value
    ? user?.realizedPNLFormatted?.value
    : "--";
  const livePnl = user?.livePNLFormatted?.value ?? "--";
  return (
    <Block className={styles.container}>
      <div className={styles.col}>
        <Typography size="body1" color="base-300">
          24h Change
        </Typography>
        <Typography
          className={styles.value}
          color={
            dayChange?.includes("--")
              ? "base-300"
              : dayChange.includes("-")
                ? "red"
                : "green"
          }
        >
          {dayChange}%{" "}
        </Typography>
      </div>
      <div className={styles.col}>
        <Typography size="body1" color="base-300">
          Unrealised PnL
        </Typography>
        <Typography
          className={styles.value}
          color={
            livePnl?.includes("--")
              ? "base-300"
              : livePnl.includes("-")
                ? "red"
                : "green"
          }
        >
          {livePnl} rUSD
        </Typography>
      </div>
      <div className={styles.col}>
        <Typography size="body1" color="base-300">
          Realized PnL
        </Typography>
        <Typography
          className={styles.value}
          color={
            realizedPnl.includes("--")
              ? "base-300"
              : realizedPnl.includes("-")
                ? "red"
                : "green"
          }
        >
          {realizedPnl} rUSD
        </Typography>
      </div>
      {!!user?.account && (
        <div className={styles.col}>
          <AccountManager />
        </div>
      )}
    </Block>
  );
};
