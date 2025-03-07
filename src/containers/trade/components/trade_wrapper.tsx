"use client";

import React, { FC, ReactNode } from "react";

import { useMarketsQuery } from "@/shared/hooks/useMarketsSWR";

interface ITradeWrapperProps {
  children: ReactNode;
}

const TradeWrapper: FC<ITradeWrapperProps> = ({ children }) => {
  useMarketsQuery();

  return <>{children}</>;
};

export default TradeWrapper;
