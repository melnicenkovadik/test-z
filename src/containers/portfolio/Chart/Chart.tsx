"use client";

import { useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { usePageContext } from "@/providers/PageContextProvider";
import Block from "@/shared/components/ui/Block";
import { Button } from "@/shared/components/ui/Button/button";
import { Typography } from "@/shared/components/ui/Typography";
import { useChartData } from "@/shared/hooks/useChartData";
import { useHistoryStoreOpen } from "@/shared/store/history.store";

import styles from "./Chart.module.scss";

export function Chart() {
  const isLoggedIn = useIsLoggedIn();
  const [timeframe, setTimeframe] = useState<string>("1h");
  const { isMobile } = usePageContext();

  const {
    chartData,
    isLoading,
    error,
    setTimeframe: setChartTimeframe,
  } = useChartData(timeframe);

  const { isHistoryOpen } = useHistoryStoreOpen();
  const [vh50, setVh50] = useState(0);
  const [vh30, setVh30] = useState(0);

  useEffect(() => {
    console.log(".innerHeight", window.innerHeight);

    if (typeof window === "undefined") return;
    const updateHeights = () => {
      setVh50(window.innerHeight * 0.5);
      setVh30(window.innerHeight * 0.28);
    };

    updateHeights(); // Initial calculation
    window.addEventListener("resize", updateHeights); // Update on resize

    return () => window.removeEventListener("resize", updateHeights);
  }, []);
  useEffect(() => {
    if (isLoggedIn && !chartData?.timeseriesData?.length && !isLoading) {
      setChartTimeframe(timeframe);
    }
  }, [isLoggedIn]);

  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!chartData) return null;

  const handleTimeframeChange = (tf: string) => {
    setTimeframe(tf);
    setChartTimeframe(tf);
  };

  return (
    <Block className={styles.container} isLoading={isLoading}>
      <div className={styles.header}>
        <div className={styles.balance_container}>
          <Typography size="body1" color="base-300" className={styles.label}>
            Portfolio Balance
          </Typography>
          <Typography
            size="heading2"
            tag="p"
            className={styles.balance}
            color="white"
          >
            {chartData.balance}
            <Typography size={"heading4"} tag="span" color="base-300">
              {" rUSD"}
            </Typography>
          </Typography>
        </div>
        <div className={styles.timeframe_buttons}>
          {["1h", "1d", "1w", "1m", "1y"].map((tf) => (
            <Button
              variant="link"
              key={tf}
              onClick={() => handleTimeframeChange(tf)}
            >
              <Typography
                size="body1"
                color={tf === timeframe ? "accent" : "base-300"}
              >
                {tf}
              </Typography>
            </Button>
          ))}
        </div>
      </div>

      <div className={styles.chart_container}>
        <ResponsiveContainer
          width="100%"
          height={isMobile ? "50%" : !isMobile && !isHistoryOpen ? vh50 : vh30}
          className={styles.chart}
        >
          <LineChart data={chartData.timeseriesData}>
            <CartesianGrid
              height={20}
              strokeDasharray="3 3"
              stroke="#2D3748"
              vertical={false}
            />
            {/*
               XAxis:
               - dataKey = "timestamp" (the numeric timestamp).
               - tickFormatter uses timeframe logic to show time or date.
            */}
            <XAxis
              dataKey="timestamp"
              axisLine={false}
              tickLine={true}
              tick={{ fill: "#6B7280", fontSize: 10 }}
              tickCount={0}
              tickSize={10}
              tickFormatter={(value) => {
                const date = new Date(value);
                if (timeframe === "1h" || timeframe === "1d") {
                  return date.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "numeric",
                  });
                } else if (timeframe === "1w" || timeframe === "1m") {
                  return date.toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                  });
                } else if (timeframe === "1y") {
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                  });
                }
                return "";
              }}
              allowDataOverflow={false}
              includeHidden={false}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
              width={40}
            />
            <Tooltip content={<CustomTooltip timeframe={timeframe} />} />
            <Line
              type="linear"
              dataKey="value"
              stroke="#02C076"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 8,
                fill: "#4DA459",
                stroke: "#17181A",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Block>
  );
}

const CustomTooltip = ({
  active,
  payload,
  label,
  timeframe,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  timeframe?: string;
}) => {
  const date = label ? new Date(label) : new Date();

  function newLabel() {
    if (timeframe === "1h") {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
      });
    } else if (timeframe === "1d") {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
      });
    } else if (timeframe === "1y") {
      if (label) {
        const date = new Date(label);
        return date.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }
      return label;
    } else {
      return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
      });
    }

    return label;
  }

  if (active && payload && payload?.length) {
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltip_value}>
          {payload[0].value.toFixed(2)} rUSD
        </p>
        <p className={styles.tooltip_label}>{newLabel()}</p>
      </div>
    );
  }
  return null;
};
