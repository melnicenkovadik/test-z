"use client";
import { useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import clsx from "clsx";
import React from "react";

import DirectionPicker from "@/containers/trade/components/LeftPanel/DirectionPicker";
import {
  CrossMarginLimitTradeForm,
  CrossMarginTradeForm,
  IsolatedTradeForm,
} from "@/containers/trade/components/LeftPanel/TradeForms";
import Settings from "@/containers/trade/components/LeftPanel/TradeSettings";
import useTradeType, {
  ORDER_TYPE,
  TRADE_TYPE,
} from "@/containers/trade/components/LeftPanel/useTradeType";
import AccountSelect from "@/shared/components/AccountSelect";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/shared/components/ui/Dialog";
import { useFormInitialization } from "@/shared/hooks/useFormInitialization";
import useUserStore from "@/shared/store/user.store";

import s from "../left-panel.module.scss";

const MobileLeftPanel = () => {
  const [isOpenDialog, setIsOpenDialog] = React.useState(false);
  const { tradeType, crossMarginFormOrderType } = useTradeType();
  const { user, accounts } = useUserStore();
  const isLoggedIn = useIsLoggedIn();

  useFormInitialization();

  const Form = () => {
    switch (tradeType) {
      case TRADE_TYPE.ISOLATED:
        return <IsolatedTradeForm />;
      case TRADE_TYPE.MARGIN:
        if (crossMarginFormOrderType === ORDER_TYPE.LIMIT) {
          return <CrossMarginLimitTradeForm />;
        }
        return <CrossMarginTradeForm />;
      default:
        return null;
    }
  };
  React.useEffect(() => {
    if (isOpenDialog) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpenDialog]);

  return (
    <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
      <DialogTrigger asChild>
        <div className={s.trade_container__header}>
          <DirectionPicker isMini />
        </div>
      </DialogTrigger>
      <DialogContent>
        <div className={clsx(s.trade_container, s.trade_container__mobile)}>
          <DirectionPicker />
          {isLoggedIn && user && accounts ? (
            <AccountSelect
              classname={s.acc_classname}
              selectClassName={s.acc_select_class_name}
              selectContentClassName={s.acc_select_content_class_name}
              selectLabelClassName={s.acc_select_label_class_name}
            />
          ) : null}
          <Settings />
          <div className={s.trade_container__form}>{Form()}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MobileLeftPanel;
