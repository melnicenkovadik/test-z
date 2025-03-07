import React from "react";

import useTradeType, {
  TRADE_TYPE,
} from "@/containers/trade/components/LeftPanel/useTradeType";
import CustomSelect from "@/shared/components/ui/Select";

import s from "./TradeSettings.module.scss";

const TradeSettings = () => {
  const {
    tradeType,
    crossMarginFormOrderType,
    tradeTypeOptions,
    orderTypeOptions,
    setTradeType,
    setCrossMarginFormOrderType,
  } = useTradeType();

  return (
    <div className={s.trade_settings}>
      <CustomSelect
        placeholder="Trade type"
        options={tradeTypeOptions.map((option) => ({
          label: option.label as string,
          value: option.value as any,
        }))}
        value={{
          label: tradeTypeOptions.find((option) => option.value === tradeType)
            ?.label as string,
          value: tradeType as any,
        }}
        onChange={(value) => setTradeType(value.value)}
      />
      <CustomSelect
        placeholder="Order type"
        isDisabled={tradeType === TRADE_TYPE.ISOLATED}
        options={orderTypeOptions.map((option) => ({
          label: option.label as string,
          value: option.value as any,
        }))}
        value={{
          label: orderTypeOptions.find(
            (option) => option.value === crossMarginFormOrderType,
          )?.label as string,
          value: crossMarginFormOrderType as any,
        }}
        onChange={(value) => setCrossMarginFormOrderType(value.value)}
      />
    </div>
  );
};

export default TradeSettings;
