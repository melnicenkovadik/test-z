import Image from "next/image";
import React, { FC, useCallback, useState } from "react";

import AccountManagerList from "@/shared/components/AccountManager/AccountManagerList";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/Popover/Popover";
import useUserStore from "@/shared/store/user.store";

import s from "./AccountManager.module.scss";

const AccountManager: React.FC = () => {
  const { accounts, user, setUser, isOverview, toggleIsOverview } =
    useUserStore();
  const [open, setOpen] = useState(false);

  const handleAccountChange = useCallback(
    (e: any, selected: any) => {
      const newAccount = {
        account: user?.account,
        ...selected,
      };
      console.log("newAccount", newAccount);
      if (selected.isOverview) {
        toggleIsOverview();
      } else if (isOverview) {
        toggleIsOverview();
      }

      setUser(newAccount);
      setOpen(false);
    },
    [user, isOverview],
  );

  return (
    <div className={s.account_manager}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className={s.account_manager__trigger}>
            <p>{isOverview ? "Summary" : user?.name}</p>
            <Image
              className={s.select__icon__arrow}
              src="/assets/icons/arr_down.svg"
              alt="Arrow down"
              style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
              width={16}
              height={16}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={4}
          className={s.account_manager__list_wrapper}
        >
          <AccountManagerList
            accounts={accounts}
            user={user}
            isOverview={isOverview}
            handleAccountChange={handleAccountChange}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

interface IAccountLabel {
  name: string;
  totalPositionsCount: number;
  balance: string;
}

export const AccountLabel: FC<IAccountLabel> = ({
  name,
  balance,
  totalPositionsCount = 0,
}) => {
  return (
    <div>
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
export default AccountManager;
