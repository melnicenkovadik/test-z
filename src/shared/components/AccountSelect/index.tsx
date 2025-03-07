import clsx from "clsx";
import React, { FC, useEffect, useState } from "react";

import CustomSelect from "@/shared/components/ui/Select";
import useUserStore from "@/shared/store/user.store";

import s from "./account_select.module.scss";

interface IAccountSelect {
  classname?: string;
  selectClassName?: string;
  selectContentClassName?: string;
  selectLabelClassName?: string;
  withAllOption?: any;
  withBalance?: boolean;
}

const AccountSelect: React.FC<IAccountSelect> = ({
  classname,
  selectClassName,
  selectContentClassName,
  selectLabelClassName,
  withAllOption = undefined,
  withBalance = false,
}) => {
  const { accounts, user, setUser, isOverview, toggleIsOverview } =
    useUserStore();
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const allOption = {
    name: "All",
  };

  const handleAccountChange = (selectedOption: any) => {
    const isAllOption =
      typeof withAllOption !== "undefined" && withAllOption !== null;
    if (isAllOption && selectedOption?.value?.name === "All") {
      // @ts-ignore
      withAllOption?.set((prev) => !prev);
      return;
    } else if (selectedOption?.value?.id !== user?.id) {
      if (isAllOption) {
        withAllOption?.set(false);
      }
      const newAccount = {
        account: user?.account,
        ...selectedOption.value,
      };
      if (isOverview) {
        toggleIsOverview();
      }
      setUser(newAccount);
    }
  };

  useEffect(() => {
    if (user && user.account) {
      const isAllOption =
        typeof withAllOption !== "undefined" && withAllOption !== null;
      const isAllOptionSelected = isAllOption && withAllOption.isSelected;
      const name = isAllOption && isAllOptionSelected ? "All" : user.name;
      const totalPositionsCount = isAllOptionSelected
        ? accounts.reduce(
            // @ts-ignore
            (acc, account) => acc + +account?.totalPositionsCount,
            0,
          )
        : user.totalPositionsCount;
      const balance = isAllOptionSelected
        ? accounts.reduce(
            (acc, account) => acc + +account?.totalBalanceFormatted?.value,
            0,
          )
        : user.totalBalanceFormatted?.value;

      const newAcc = {
        value: {
          ...user,
          name: name,
        },
        label: withBalance ? (
          <AccountLabel
            totalPositionsCount={totalPositionsCount}
            name={name}
            balance={balance}
          />
        ) : (
          name
        ),
      };
      setSelectedAccount(newAcc);
    }
  }, [user, withAllOption?.isSelected, setSelectedAccount]);

  if (!user) return null;
  if (!accounts?.length) return null;

  return (
    <div className={clsx(s.account_select, classname)}>
      <CustomSelect
        className={clsx(s.select, selectClassName)}
        selectContentClassName={clsx(s.select_content, selectContentClassName)}
        selectLabelClassName={clsx(s.select_label, selectLabelClassName)}
        placeholder="Select Account"
        options={(!!withAllOption ? [allOption, ...accounts] : accounts)
          .filter((account: any) => account.id !== user.id)
          .map((account: any) => ({
            value: account,
            label: (
              <AccountLabel
                totalPositionsCount={account?.totalPositionsCount}
                name={account?.name}
                balance={account?.totalBalanceFormatted?.value}
              />
            ),
          }))}
        value={
          selectedAccount || {
            value: user,
            label: (
              <AccountLabel
                totalPositionsCount={user?.totalPositionsCount}
                name={user?.name as string}
                balance={user?.totalBalanceFormatted?.value}
              />
            ),
          }
        }
        onChange={handleAccountChange}
      />
    </div>
  );
};

interface IAccountLabel {
  name: string;
  totalPositionsCount: number;
  balance: string;
}

export const AccountLabel: FC<IAccountLabel> = ({
  name = "All",
  balance,
  totalPositionsCount = 0,
}) => {
  return (
    <div
      className={clsx(s.account_label, {
        [s.all]: name === "All",
      })}
    >
      <span>
        {name}{" "}
        {totalPositionsCount && totalPositionsCount > 0
          ? `(${totalPositionsCount})`
          : ""}
      </span>
      {balance && <span>({balance} rUSD)</span>}
    </div>
  );
};
export default AccountSelect;
