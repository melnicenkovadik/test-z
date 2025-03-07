"use client";

import { MarginAccountBalanceGranularity } from "@reyaxyz/api-sdk";
import { format } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";

import useUserStore from "@/shared/store/user.store";
import { RANGE_ID_TO_TIMEFRAME_MS } from "@/shared/utils/_common/constants";

import {
  GetMarginAccountBalanceChartDataResult,
  getMarginAccountBalanceChartDataService,
} from "src/services/margin-account/getMarginAccountBalanceChartDataService";

// Each point is stored with raw timestamp and a formatted date
export interface ChartDataPoint {
  timestamp: number;
  dateFormatted: string;
  value: number;
}

export interface ChartData {
  balance: string;
  percentageChange: string;
  timeseriesData: ChartDataPoint[];
}

export const useChartData = (initialTimeframe: string) => {
  const { user } = useUserStore();
  const marginAccountId = user?.id || null;
  const [timeframe, setTimeframe] = useState(initialTimeframe);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateEmptyChartData = useCallback((): ChartData => {
    const now = Date.now();
    return {
      balance: "0.00",
      percentageChange: "0.00%",
      timeseriesData: Array.from({ length: 30 }, (_, index) => {
        const ts = now - index * 24 * 60 * 60 * 1000;
        return {
          timestamp: ts,
          dateFormatted: format(ts, "dd MMM HH:mm"),
          value: 0,
        };
      }).reverse(),
    };
  }, []);

  const timeframeMs = useMemo(() => {
    return (
      RANGE_ID_TO_TIMEFRAME_MS[timeframe] || RANGE_ID_TO_TIMEFRAME_MS["1d"]
    );
  }, [timeframe]);

  const granularity = useMemo(() => {
    if (timeframe === "1h") return MarginAccountBalanceGranularity.ONE_MINUTE;
    if (timeframe === "1d") return MarginAccountBalanceGranularity.ONE_HOUR;
    // 1w, 1m, 1y default to ONE_DAY
    return MarginAccountBalanceGranularity.ONE_DAY;
  }, [timeframe]);

  const fetchChartData = useCallback(async () => {
    if (!marginAccountId) {
      setChartData(generateEmptyChartData());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = {
        marginAccountId,
        filters: {
          granularity,
          timeframeMs,
        },
      };

      const result: GetMarginAccountBalanceChartDataResult =
        await getMarginAccountBalanceChartDataService(params);

      if (!result?.balanceData?.length) {
        setError("No data available");
        setChartData(generateEmptyChartData());
        setIsLoading(false);
        return;
      }

      // 1) Do not slice the last data point, keep them all
      // 2) Store both raw timestamp (for correct sorting & filtering)
      //    and a formatted date string (for display)
      let transformedData = result.balanceData.map((d) => {
        return {
          timestamp: d.timestampInMs,
          dateFormatted: format(d.timestampInMs, "dd MMM HH:mm"),
          value: d.value,
        };
      });

      // Sort ascending by timestamp (older -> newer)
      transformedData.sort((a, b) => a.timestamp - b.timestamp);

      // If timeframe is 1y, we filter so that we only keep
      // first day of the month or the final data point
      if (timeframe === "1y") {
        transformedData = transformedData.filter((point, index, arr) => {
          const dateObj = new Date(point.timestamp);
          const isFirstDayOfMonth = dateObj.getDate() === 1;
          const isLastPoint = index === arr.length - 1;
          return isFirstDayOfMonth || isLastPoint;
        });
      }

      setChartData({
        balance: result.balance.toFixed(2),
        percentageChange: `${result.balanceChangePercentage.toFixed(2)}%`,
        timeseriesData: transformedData,
      });
    } catch (err) {
      setError("Failed to fetch chart data");
      setChartData(generateEmptyChartData());
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [
    marginAccountId,
    granularity,
    timeframeMs,
    timeframe,
    generateEmptyChartData,
  ]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  return {
    chartData,
    isLoading,
    error,
    setTimeframe,
    loadChartData: fetchChartData,
  };
};
