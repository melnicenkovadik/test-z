import { create } from "zustand";
import { persist } from "zustand/middleware";

export enum TRADE_TYPE {
  ISOLATED = "isolated-trade",
  MARGIN = "cross-margin-trade",
}

export enum ORDER_TYPE {
  LIMIT = "limit",
  MARKET = "market",
}

interface ITradeType {
  tradeType: TRADE_TYPE;
  crossMarginFormOrderType: ORDER_TYPE;
  tradeTypeOptions: { label: string; value: TRADE_TYPE }[];
  orderTypeOptions: { label: string; value: ORDER_TYPE }[];
  setTradeType: (type: TRADE_TYPE) => void;
  setCrossMarginFormOrderType: (orderType: ORDER_TYPE) => void;
}

const useTradeType = create<ITradeType>()(
  persist(
    (set) => ({
      tradeType: TRADE_TYPE.MARGIN,
      crossMarginFormOrderType: ORDER_TYPE.MARKET,

      tradeTypeOptions: [
        { label: "Cross", value: TRADE_TYPE.MARGIN },
        { label: "Isolated", value: TRADE_TYPE.ISOLATED },
      ],

      orderTypeOptions: [
        { label: "Limit", value: ORDER_TYPE.LIMIT },
        { label: "Market", value: ORDER_TYPE.MARKET },
      ],

      setTradeType: (type) =>
        set(() => {
          if (type === TRADE_TYPE.ISOLATED) {
            return {
              tradeType: type,
              crossMarginFormOrderType: ORDER_TYPE.MARKET,
            };
          } else if (type === TRADE_TYPE.MARGIN) {
            return { tradeType: type };
          } else {
            console.warn(`Invalid trade type: ${type}`);
            return {};
          }
        }),

      setCrossMarginFormOrderType: (orderType) =>
        set((state) => {
          if (
            state.tradeType === TRADE_TYPE.MARGIN &&
            Object.values(ORDER_TYPE).includes(orderType)
          ) {
            return { crossMarginFormOrderType: orderType };
          } else {
            console.warn(`Invalid order type or unsupported trade type.`);
            return {};
          }
        }),
    }),
    {
      name: "trade-type-storage",
      partialize: (state) => ({
        tradeType: state.tradeType,
        crossMarginFormOrderType: state.crossMarginFormOrderType,
      }),
    },
  ),
);

export default useTradeType;
