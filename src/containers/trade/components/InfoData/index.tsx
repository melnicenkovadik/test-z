"use client";
import React, { memo, useEffect, useMemo, useState } from "react";

import { candlesSubscriptionsByChannelId } from "@/containers/trade/components/Chart/components/PriceChart/TradingViewChart/cache";
import SelectMarket from "@/containers/trade/components/InfoData/components/SelectMarket";
import { Checkbox } from "@/shared/components/ui/Checkbox";
import { useMarketStore } from "@/shared/store/useMarketStore";
import { priceFormatter } from "@/shared/utils/ui-minions";

import s from "./InfoData.module.scss";

export const getCurrentMarketPrice = (ticker?: string) => {
  if (!ticker) return undefined;
  const selectedMarketTicker =
    Array.from(candlesSubscriptionsByChannelId.values())?.find((item) =>
      item.subscribeUID?.includes(ticker),
    ) || null;
  return selectedMarketTicker?.lastBar?.close || null;
};

const InfoData = () => {
  const { selectedMarket } = useMarketStore();
  const [lastPriceRef, setLastPriceRef] = useState<number | string | null>(
    "---",
  );

  useEffect(() => {
    if (!selectedMarket) return;
    const selectedMarketTicker =
      Array.from(candlesSubscriptionsByChannelId.values())?.find((item) =>
        item.subscribeUID?.includes(selectedMarket?.ticker),
      ) || null;

    if (!selectedMarketTicker) {
      setLastPriceRef(selectedMarket?.markPrice);
      return;
    }
    const timer = setInterval(() => {
      const lastPrice = selectedMarketTicker?.lastBar?.close || lastPriceRef;
      if (lastPrice !== lastPriceRef) {
        setLastPriceRef(lastPrice);
      }
    }, 700);

    return () => clearInterval(timer);
  }, [selectedMarket, lastPriceRef]);

  const [isTokenMode, setIsTokenMode] = useState(true);

  const formattedLastPrice = useMemo(() => {
    return lastPriceRef && selectedMarket
      ? `${priceFormatter(+lastPriceRef, { precision: selectedMarket?.tickSizeDecimals })} rUSD`
      : "---";
  }, [lastPriceRef, selectedMarket]);

  const volume24h = useMemo(() => {
    if (!selectedMarket) return "---";
    const volumeUsd = selectedMarket?.volume24H || 0;
    const markPrice = selectedMarket?.markPrice || 0;

    if (isTokenMode && markPrice > 0) {
      const volumeToken = volumeUsd / markPrice;
      return `${volumeToken.toFixed(2)} ${selectedMarket.quoteToken || ""}`;
    }
    return `$${selectedMarket?.volume24HFormatted?.value}${selectedMarket?.volume24HFormatted?.suffix}`;
  }, [selectedMarket, isTokenMode]);

  const change24h = useMemo(() => {
    if (!selectedMarket) return "---";
    return selectedMarket?.priceChange24HFormatted;
  }, [selectedMarket]);

  const changeStyle = useMemo(() => {
    const isNegative = selectedMarket?.priceChange24HFormatted
      ?.toString()
      .includes("-");
    return { color: isNegative ? "var(--red)" : "var(--green)" };
  }, [selectedMarket]);

  const liquidity = useMemo(() => {
    if (!selectedMarket) {
      return { long: "---", short: "---" };
    }
    const markPrice = selectedMarket?.markPrice || 0;
    const longUsd = selectedMarket?.availableLong || 0;
    const shortUsd = selectedMarket?.availableShort || 0;

    if (isTokenMode && markPrice > 0) {
      const longToken = longUsd / markPrice;
      const shortToken = shortUsd / markPrice;
      return {
        long: longToken.toFixed(2),
        short: shortToken.toFixed(2),
      };
    }
    return {
      long: selectedMarket?.availableLongFormatted?.value || 0,
      short: selectedMarket?.availableShortFormatted?.value || 0,
    };
  }, [selectedMarket, isTokenMode]);

  const openInterest = useMemo(() => {
    if (!selectedMarket) {
      return { long: "---", short: "---" };
    }
    const markPrice = selectedMarket?.markPrice || 0;
    const longOIUsd = selectedMarket?.longOI || 0;
    const shortOIUsd = selectedMarket?.shortOI || 0;

    if (isTokenMode && markPrice > 0) {
      const longOI = longOIUsd / markPrice;
      const shortOI = shortOIUsd / markPrice;
      return {
        long: longOI?.toFixed(2),
        short: shortOI?.toFixed(2),
      };
    }
    return {
      long: selectedMarket?.longOIFormatted?.value,
      short: selectedMarket?.shortOIFormatted?.value,
    };
  }, [selectedMarket, isTokenMode]);

  const fundingRateStyle = useMemo(() => {
    if (!selectedMarket?.fundingRateFormatted) return {};
    const isNegative = selectedMarket.fundingRateFormatted.startsWith("-");
    return { color: isNegative ? "var(--red)" : "var(--green)" };
  }, [selectedMarket]);

  const fundingRate = selectedMarket?.fundingRateFormatted || "---";

  return (
    <div className={s.container}>
      <div className={s.select_market}>
        <SelectMarket />
        <div className={s.balance}>{formattedLastPrice}</div>
      </div>
      <div className={s.item}>
        <p className={s.title}>24h Volume</p>
        <span className={s.value}>{volume24h}</span>
      </div>
      <div className={s.item}>
        <p className={s.title}>24h Change</p>
        <span className={s.value} style={changeStyle}>
          {change24h}%
        </span>
      </div>
      <div className={s.item}>
        <p className={s.title}>Liquidity</p>
        <span className={s.value}>
          <span className="green">{liquidity.long}</span>
          <span className={s.liquidity_value__slash}>/</span>
          <span className="red">{liquidity.short}</span>
        </span>
      </div>
      <div className={s.item}>
        <p className={s.title}>Open Interest</p>
        <span className={s.value}>
          <span className="green">{openInterest?.long}</span>
          <span className={s.open_interest_value__slash}>/</span>
          <span className="red">{openInterest?.short}</span>
        </span>
      </div>
      <div className={s.item}>
        <p className={s.title}>Funding Rate</p>
        <span className={s.value} style={fundingRateStyle}>
          {fundingRate}%
        </span>
      </div>
      <Checkbox
        label="USD Mode"
        checked={!isTokenMode}
        className={s.checkbox}
        onCheckedChange={() => setIsTokenMode((prev) => !prev)}
        disabled={!selectedMarket}
      />
    </div>
  );
};

export default memo(InfoData);
