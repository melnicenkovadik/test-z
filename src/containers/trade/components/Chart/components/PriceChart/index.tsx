"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { useMarketStore } from "@/shared/store/useMarketStore";

const TradingViewChart = dynamic(
  () =>
    import(
      "@/containers/trade/components/Chart/components/PriceChart/TradingViewChart"
    ),
  { ssr: false },
);

export const PriceChart: React.FunctionComponent = () => {
  const { selectedMarket } = useMarketStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 200);
  }, []);
  if (!selectedMarket) return null;

  if (!mounted) return null;

  return <TradingViewChart />;
};
