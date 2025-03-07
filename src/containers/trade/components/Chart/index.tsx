"use client";
import React from "react";

import { PriceChart } from "@/containers/trade/components/Chart/components/PriceChart";
import { ReyaChartsProvider } from "@/containers/trade/components/Chart/useReyaChartsClient";

const Chart = () => {
  const [isWindowLoaded, setIsWindowLoaded] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setIsWindowLoaded(true);
    }
  }, []);

  return isWindowLoaded ? (
    <ReyaChartsProvider>
      <PriceChart />
    </ReyaChartsProvider>
  ) : null;
};

export default Chart;
