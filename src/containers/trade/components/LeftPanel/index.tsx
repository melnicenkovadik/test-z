"use client";
import { useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import React from "react";

import {
  CrossMarginLimitTradeForm,
  CrossMarginTradeForm,
  IsolatedTradeForm,
} from "@/containers/trade/components/LeftPanel/TradeForms";
import Settings from "@/containers/trade/components/LeftPanel/TradeSettings";
import useTradeType, {
  TRADE_TYPE,
  ORDER_TYPE,
} from "@/containers/trade/components/LeftPanel/useTradeType";
import AccountSelect from "@/shared/components/AccountSelect";
import { useFormInitialization } from "@/shared/hooks/useFormInitialization";
import useUserStore from "@/shared/store/user.store";

import DirectionPicker from "./DirectionPicker";
import s from "./left-panel.module.scss";

const LeftPanel = () => {
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

  return (
    <div className={s.trade_container}>
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
  );
};

export default LeftPanel;
