import clsx from "clsx";
import Image from "next/image";
import React, { FC, useCallback, useMemo } from "react";

import s from "@/shared/components/AccountManager/AccountManager.module.scss";

interface IAccountManagerList {
  accounts: any;
  user: any;
  isOverview: boolean;
  handleAccountChange: (e: any, selected: any) => void;
}

const AccountManagerList: FC<IAccountManagerList> = ({
  accounts,
  user,
  isOverview,
  handleAccountChange,
}) => {
  const overviewAccountsOption = useMemo(() => {
    const totalBalance = accounts.reduce((acc: any, account: any) => {
      return acc + +account?.totalBalanceFormatted?.value;
    }, 0);
    const totalPositionsCount = accounts.reduce((acc: any, account: any) => {
      return acc + +account?.totalPositionsCount;
    }, 0);
    const totalRealizedPNL = accounts.reduce((acc: any, account: any) => {
      return acc + +account?.realizedPNLFormatted?.value;
    }, 0);
    return {
      ...user,
      name: "Summary",
      isOverview: true,
      totalBalanceFormatted: {
        value: totalBalance.toFixed(2),
      },
      totalPositionsCount: totalPositionsCount,
      realizedPNLFormatted: {
        value: totalRealizedPNL.toFixed(2),
      },
    };
  }, []);

  const accountsList = useMemo(() => {
    return [overviewAccountsOption, ...accounts];
  }, [accounts, user?.id, user?.name]);

  const isActiveAccount = useCallback(
    function (acc: any) {
      return (
        (acc.id === user?.id && !isOverview && !acc.isOverview) ||
        (isOverview && acc.isOverview)
      );
    },
    [user, isOverview],
  );

  return (
    <div className={s.account_manager__list} id="AccountManagerList">
      {accountsList.map((account: any) => {
        const isPNLPositiveCondition =
          +account?.realizedPNLFormatted?.value >= 0;
        const pnlColor =
          +account?.realizedPNLFormatted?.value === 0
            ? "var(--white-base)"
            : isPNLPositiveCondition
              ? "var(--green)"
              : "var(--red)";

        return (
          <div
            key={account.id}
            className={clsx(s.account_manager__list__item, {
              [s.account_manager__list__item__active]: isActiveAccount(account),
            })}
            onClick={(e) => handleAccountChange(e, account)}
          >
            <div className={s.acc_left}>
              <div className={s.acc_icon}>
                <Image
                  src={
                    account?.isOverview
                      ? "/assets/icons/overview.svg"
                      : "/assets/icons/account.svg"
                  }
                  alt={account.name}
                  width={24}
                  height={24}
                />
              </div>
              <p
                className={clsx(s.acc_name, {
                  [s.acc_name__overview]: account?.isOverview,
                })}
              >
                {account.name}
              </p>
            </div>
            <div className={s.acc_right}>
              <div className={clsx(s.acc_right__balance, s.acc_right__col)}>
                <p className={s.acc_value_label}>Bal</p>
                <p className={s.acc_value__balance}>
                  {account?.totalBalanceFormatted?.value}
                </p>
              </div>
              <div className={clsx(s.acc_right__pos, s.acc_right__col)}>
                <p className={s.acc_value_label}>Pos</p>
                <p className={s.acc_value__pos}>
                  {account?.totalPositionsCount}
                </p>
              </div>
              <div className={clsx(s.acc_right__pnl, s.acc_right__col)}>
                <p className={s.acc_value_label}>PnL</p>
                <p style={{ color: pnlColor }} className={s.acc_value__pnl}>
                  {account?.realizedPNLFormatted?.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AccountManagerList;
