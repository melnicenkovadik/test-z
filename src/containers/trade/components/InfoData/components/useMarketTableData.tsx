"use client";
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { usePageContext } from "@/providers/PageContextProvider";
import { MarketUI } from "@/services/markets/types";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useMarketStore } from "@/shared/store/useMarketStore";
import { abbreviateNumber } from "@/shared/utils/ui-minions";

import s from "./MarketsTableBody.module.scss";
import {
  getIcon,
  hasIcon,
} from "../../../../../../public/assets/icons/coins/avalible_icons";

const columnHelper = createColumnHelper<MarketUI>();

interface IUseMarketTableDataProps {
  isTokenMode: boolean;
}

export function useMarketTableData({ isTokenMode }: IUseMarketTableDataProps) {
  const { isMobile } = usePageContext();
  const { markets, selectedMarket, setSelectedMarket } = useMarketStore();

  // ------------------
  // Столбцы
  // ------------------
  const TICKER_COLUMN = columnHelper.accessor("ticker", {
    id: "ticker",
    header: "Markets",
    enableSorting: true,
    cell: (info) => {
      const row = info.row.original;
      return (
        <span className={s.ticker_value}>
          <div className={s.ticker_value_icon}>
            {hasIcon(row?.quoteToken) ? (
              <Image
                src={getIcon(row?.quoteToken) || ""}
                alt="icon"
                width={24}
                height={24}
              />
            ) : null}
            {row?.ticker}
          </div>
        </span>
      );
    },
  });

  const MARKET_COLUMN = columnHelper.accessor("markPrice", {
    id: "markPrice",
    header: "Price (USD)",
    cell: (info) => {
      const priceUsd = info.getValue() || 0;
      return (
        <span className={s.price_value}>${priceUsd?.toFixed(2) || 0}</span>
      );
    },
  });

  // Пример: volume24H хранится в USD, но если isTokenMode=true, показываем в токене
  const VOLUME_COLUMN = columnHelper.accessor("volume24H", {
    id: "volume24h",
    header: isTokenMode ? "24h Volume" : "24h Volume (USD)",
    enableSorting: true,
    cell: (info) => {
      const row = info?.row?.original;
      const volumeUsd = row?.volume24H || 0;
      const markPrice = row?.markPrice || 0; // USD за 1 token

      // Предположим, токен = quoteToken для конкретного рынка
      // isTokenMode => показываем в TOKEN:
      if (isTokenMode && markPrice > 0) {
        const volumeToken = volumeUsd / markPrice;
        return <span>{volumeToken.toFixed(2)}</span>;
      }
      // Иначе — показываем в USD
      return <span>${volumeUsd.toFixed(2)}</span>;
    },
  });

  const PRICE_CHANGE_COLUMN = columnHelper.accessor("priceChange24H", {
    id: "priceChange24H",
    header: "24h Change",
    enableSorting: true,
    cell: (info) => {
      const row = info.row.original;
      const value = row?.priceChange24H || 0;
      const color = value < 0 ? s.red : s.green;
      return (
        <span className={clsx(s.change_value, color)}>
          <Image
            src={`assets/icons/arr_${value < 0 ? "short" : "long"}.svg`}
            alt="change"
            width={16}
            height={16}
          />
          {Math.abs(value).toFixed(2)}
          <span style={{ marginLeft: "-6px" }}>%</span>
        </span>
      );
    },
  });

  // Ликвидность (availableLong, availableShort) – тоже в USD
  // если isTokenMode=true => делим на markPrice
  const LIQUIDITY_COLUMN = columnHelper.accessor("availableLong", {
    id: "marketliquidity",
    header: isTokenMode ? "Liquidity" : "Liquidity (USD)",
    enableSorting: true,
    cell: (info) => {
      const row = info.row.original;
      const longUsd = row?.availableLong || 0;
      const shortUsd = row?.availableShort || 0;
      const markPrice = row?.markPrice || 0;

      if (isTokenMode && markPrice > 0) {
        const longToken = longUsd / markPrice;
        const shortToken = shortUsd / markPrice;
        return (
          <span className={s.liquidity_value}>
            <span className="green">
              {abbreviateNumber(longToken?.toFixed(2) || 0)}
            </span>
            <span className={s.open_interest_value__slash}>/</span>
            <span className="red">
              {abbreviateNumber(shortToken?.toFixed(2) || 0)}
            </span>
          </span>
        );
      }

      return (
        <span className={s.liquidity_value}>
          <span className="green">{abbreviateNumber(longUsd?.toFixed(2))}</span>
          <span className={s.open_interest_value__slash}>/</span>
          <span className="red">{abbreviateNumber(shortUsd?.toFixed(2))}</span>
        </span>
      );
    },
  });

  // Open Interest
  const OI_COLUMN = columnHelper.accessor("longOI", {
    id: "marketopenInterest",
    header: isTokenMode ? "Open Interest" : "Open Interest (USD)",
    enableSorting: true,
    cell: (info) => {
      const row = info.row.original;
      const longOIUsd = row?.longOI || 0;
      const shortOIUsd = row?.shortOI || 0;
      const markPrice = row?.markPrice || 0;

      if (isTokenMode && markPrice > 0) {
        const longOI = longOIUsd / markPrice;
        const shortOI = shortOIUsd / markPrice;
        return (
          <span className={s.open_interest_value}>
            <span className="green">
              {abbreviateNumber(longOI?.toFixed(2) || 0)}
            </span>
            <span className={s.open_interest_value__slash}>/</span>
            <span className="red">
              {abbreviateNumber(shortOI?.toFixed(2) || 0)}
            </span>
          </span>
        );
      }
      return (
        <span className={s.open_interest_value}>
          <span className="green">
            {abbreviateNumber(longOIUsd?.toFixed(2) || 0)}
          </span>
          <span className={s.open_interest_value__slash}>/</span>
          <span className="red">
            {abbreviateNumber(shortOIUsd?.toFixed(2) || 0)}
          </span>
        </span>
      );
    },
  });

  // FundingRate и Skew пусть останутся без изменений (не зависят от USD/Token).
  const FUNDING_COLUMN = columnHelper.accessor("fundingRate", {
    id: "fundingRate",
    header: "Funding Rate",
    enableSorting: true,
    cell: (info) => {
      const row = info?.row?.original;
      const value = row?.fundingRate || 0;
      const color = value < 0 ? s.red : s.green;
      return (
        <span className={clsx(s.change_value, color)}>
          <Image
            src={`assets/icons/arr_${value < 0 ? "short" : "long"}.svg`}
            alt="change"
            width={16}
            height={16}
          />
          {value.toFixed(2)}
          <span style={{ marginLeft: "-6px" }}>%</span>
        </span>
      );
    },
  });

  const SKEW_COLUMN = columnHelper.accessor("longSkewPercentage", {
    id: "skew",
    enableSorting: true,
    header: "Skew",
    cell: (info) => {
      const row = info.row.original;
      const longSkew = row?.longSkewPercentage || 0;
      const shortSkew = row?.shortSkewPercentage || 0;
      return (
        <span className={clsx(s.change_value)}>
          <span className="green">{longSkew?.toFixed(2) || 0}%</span>
          <span className={s.skew_value__slash}>/</span>
          <span className="red">{shortSkew?.toFixed(2) || 0}%</span>
        </span>
      );
    },
  });

  const ALL_COLUMNS = [
    TICKER_COLUMN,
    MARKET_COLUMN,
    VOLUME_COLUMN,
    PRICE_CHANGE_COLUMN,
    LIQUIDITY_COLUMN,
    OI_COLUMN,
    FUNDING_COLUMN,
    SKEW_COLUMN,
  ];

  // Мобильная версия короче:
  const COLUMNS = isMobile
    ? [TICKER_COLUMN, MARKET_COLUMN, PRICE_CHANGE_COLUMN]
    : ALL_COLUMNS;

  // ------------------
  // 3. Селекшн, поиск, сортировка
  // ------------------
  const [value, setValue] = useState({
    value: selectedMarket,
    label: selectedMarket?.ticker,
    icon: selectedMarket?.quoteToken || undefined,
  });

  useEffect(() => {
    if (selectedMarket && !value.label) {
      setValue({
        value: selectedMarket,
        label: selectedMarket?.ticker,
        icon: selectedMarket?.quoteToken || undefined,
      });
    }
  }, [selectedMarket]);

  const [searchMarketInput, setSearchMarketInput] = useState("");
  const debouncedMarketInput = useDebounce(searchMarketInput, 300);

  const MARKETS_TABLE_DATA = useMemo(() => {
    return debouncedMarketInput
      ? markets.filter((market) =>
          market.ticker
            .toLowerCase()
            .includes(debouncedMarketInput?.toLowerCase()),
        )
      : markets;
  }, [markets, debouncedMarketInput]);

  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: MARKETS_TABLE_DATA,
    columns: COLUMNS,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return {
    COLUMNS,
    setSelectedMarket,
    selectedMarket,
    value,
    setValue,
    searchMarketInput: debouncedMarketInput,
    setSearchMarketInput,
    MARKETS_TABLE_DATA,
    table,
  };
}
