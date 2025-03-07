"use client";
import { GetMarginAccountOrderHistoryPaginatedParams } from "@reyaxyz/api-sdk";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  historyColumns,
  summaryColumns,
  ordersHistoryColumns,
  overviewColumns,
  positionsColumns,
  transfersColumns,
} from "@/containers/portfolio/Tables/helpers/columns";
import { TTabName } from "@/containers/portfolio/Tables/tables.types";
import { getConditionalOrdersHistoryForWalletService } from "@/services/conditional-orders/services";
import { getMAPositionsHistoryService } from "@/services/margin-account/getMAPositionsHistoryService";
import {
  getMATransactionHistoryService,
  GetMATransactionHistoryParams,
} from "@/services/margin-account/getMATransactionHistoryService";
import { useMarketStore } from "@/shared/store/useMarketStore";
import useUserStore from "@/shared/store/user.store";
import { mapMAPositionsHistoryEntityToMAPositionsHistoryUI } from "@/shared/utils/_common";
import { mapConditionalOrderEntityToConditionalOrderEntityUI } from "@/shared/utils/_common/mappers/mapConditionalOrderEntityToConditionalOrderEntityUI";
import { notEmpty } from "@/shared/utils/notEmpty";

// ------------------
// Column definitions
// ------------------
const COLUMNS_MAP = {
  Summary: summaryColumns,
  Overview: overviewColumns,
  Positions: positionsColumns,
  Orders: ordersHistoryColumns,
  History: historyColumns,
  Transfers: transfersColumns,
};

// ------------------
// Types
// ------------------
type TableDataState = {
  summary: any[] | null; // user?.accounts
  positions: any[] | null; // user?.positions
  overviews: any[] | null; // user?.collaterals
  tradeHistory: any[] | null; // for "History" tab
  transfersHistory: any[] | null; // for "Transfers" tab
  ordersHistory: any[] | null; // for "Orders" tab
};

type UseTableDataProps = {
  excludeTabs?: TTabName[];
  firstTab?: TTabName;
};

// ------------------
// Hook
// ------------------
export function useTableData({
  excludeTabs = [],
  firstTab = "Overview",
}: UseTableDataProps) {
  const { user, accounts } = useUserStore();
  const [ordersCount, setOrdersCount] = useState(0);
  const [activeTab, setActiveTab] = useState<TTabName>(firstTab);
  const [isTradeHistoryLoading, setIsTradeHistoryLoading] = useState(false);
  // Simple store for table data
  const [dataState, setDataState] = useState<TableDataState>({
    summary: accounts ?? null,
    positions: user?.positions ?? null,
    overviews: user?.collaterals ?? null,
    ordersHistory: null,
    tradeHistory: null,
    transfersHistory: null,
  });

  // ------------------
  // PAGINATION STATE
  // ------------------
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [transfersPage, setTransfersPage] = useState(1);
  const [transfersTotalPages] = useState(1);

  // We'll assume 10 items per page
  const perPage = 10;

  const getTradeHistory = async (page: number) => {
    if (!user?.id || !user.account?.address) return;
    try {
      setIsTradeHistoryLoading(true);
      const params: GetMarginAccountOrderHistoryPaginatedParams = {
        address: user.account.address,
        marginAccountId: user.id,
        page,
        perPage,
      };
      console.log("getTradeHistory", params);

      const markets = useMarketStore.getState().markets;
      const tradeHistoryData = await getMAPositionsHistoryService(params);
      // @ts-ignore
      const tradesWithMarkets = tradeHistoryData.data.map((trade) => {
        const market = markets.find((m) => m.id === trade.marketId);
        return { ...trade, market };
      });
      const trades = tradesWithMarkets
        .map(mapMAPositionsHistoryEntityToMAPositionsHistoryUI)
        .filter(notEmpty);

      // If the API returns totalCount, use it to compute total pages
      if (tradeHistoryData?.totalCount) {
        const total = tradeHistoryData.totalCount;
        setHistoryTotalPages(Math.ceil(total / perPage));
      }
      setDataState((prev) => ({
        ...prev,
        tradeHistory: trades,
      }));
    } catch (err) {
      console.error("Failed to fetch trade history:", err);
    } finally {
      setIsTradeHistoryLoading(false);
    }
  };

  const getTransfersHistory = useCallback(
    async (page: number) => {
      if (!user?.id) return;
      try {
        const params: GetMATransactionHistoryParams = {
          marginAccountId: user.id,
          limit: perPage * page,
        };

        const transfersHistoryData =
          await getMATransactionHistoryService(params);
        console.log("transfersHistoryData", transfersHistoryData);
        setDataState((prev) => ({
          ...prev,
          transfersHistory: transfersHistoryData ?? [],
        }));
      } catch (err) {
        console.error("Failed to fetch transfers history:", err);
      }
    },
    [user?.id],
  );

  const getOrdersHistory = useCallback(async () => {
    if (!user?.id) return;
    try {
      const markets = useMarketStore.getState().markets;
      const conditionOrdersData =
        await getConditionalOrdersHistoryForWalletService({
          walletAddress: user.account?.address,
        });

      const formattedData = conditionOrdersData
        .map(mapConditionalOrderEntityToConditionalOrderEntityUI)
        .filter(notEmpty)
        .filter((item) => item.status === "pending")
        .map((item) => {
          const market = markets.find((m) => m.id === item.marketId);
          return { ...item, market };
        });
      setOrdersCount(formattedData?.length);
      setDataState((prev) => ({
        ...prev,
        ordersHistory: formattedData,
      }));
    } catch (err) {
      console.error("Failed to fetch orders history:", err);
    }
  }, [user?.id]);

  const getPositionHistory = useCallback(() => {
    setDataState((prev) => ({
      ...prev,
      positions: user?.positions ?? [],
    }));
  }, [user?.positions]);

  const getSummary = useCallback(() => {
    setDataState((prev) => ({
      ...prev,
      summary: accounts ?? [],
    }));
  }, [accounts]);
  // ---------------------------
  // Effects to load data by tab
  // ---------------------------

  // Overview tab => just read user collaterals
  useEffect(() => {
    if (!user?.id) return;
    if (activeTab === "Overview") {
      setDataState((prev) => ({
        ...prev,
        overviews: user.collaterals ?? [],
      }));
    }
  }, [activeTab, user?.id, user?.collaterals]);
  // Summary tab
  useEffect(() => {
    if (!user?.id) return;
    if (activeTab === "Summary") {
      getSummary();
    }
  }, [activeTab, user?.id, getSummary]);

  // Positions tab
  useEffect(() => {
    if (!user?.id) return;
    if (activeTab === "Positions") {
      getPositionHistory();
    }
  }, [activeTab, user?.id, getPositionHistory]);

  // Orders tab
  useEffect(() => {
    if (!user?.id) return;
    if (activeTab === "Orders") {
      getOrdersHistory();
    }
  }, [activeTab, user?.id, getOrdersHistory]);

  // History tab => depends on historyPage
  useEffect(() => {
    if (!user?.id) return;
    if (activeTab === "History") {
      getTradeHistory(historyPage);
    }
  }, [activeTab, user?.id, historyPage]);

  // Transfers tab => depends on transfersPage
  useEffect(() => {
    if (!user?.id) return;
    if (activeTab === "Transfers") {
      getTransfersHistory(transfersPage);
    }
  }, [activeTab, user?.id, transfersPage, getTransfersHistory]);

  // ------------------
  // Excluding certain tabs
  // ------------------
  useEffect(() => {
    if (excludeTabs.includes(activeTab)) {
      // Find the first available tab
      const availableTabs: TTabName[] = [
        "Summary",
        "Overview",
        "Positions",
        "Orders",
        "History",
        "Transfers",
      ].filter((tab) => !excludeTabs.includes(tab as TTabName)) as TTabName[];

      setActiveTab(availableTabs[0] || "Overview");
    }
  }, [activeTab, excludeTabs]);

  useEffect(() => {
    getOrdersHistory();
  }, [user?.id]);

  // ------------------
  // Handler for setting active tab externally
  // ------------------
  const handleTabClick = useCallback(
    (tab: TTabName) => {
      if (excludeTabs.includes(tab)) return;
      setActiveTab(tab);
    },
    [excludeTabs],
  );

  // ------------------
  // Build up final data map
  // ------------------
  const DATA_MAP = useMemo(() => {
    const fullDataMap = {
      Summary: dataState.summary ?? [],
      Overview: dataState.overviews ?? [],
      Positions: dataState.positions ?? [],
      Orders: dataState.ordersHistory ?? [],
      History: dataState.tradeHistory ?? [],
      Transfers: dataState.transfersHistory ?? [],
    };

    // Return only tabs not excluded
    return Object.fromEntries(
      Object.entries(fullDataMap).filter(
        ([key]) => !excludeTabs.includes(key as TTabName),
      ),
    ) as Record<TTabName, any[]>;
  }, [
    dataState,
    excludeTabs,
    dataState.summary,
    user?.positions,
    user?.collaterals,
    historyPage,
    transfersPage,
  ]);

  const COLUMNS_MAP_FILTERED = useMemo(() => {
    return Object.fromEntries(
      Object.entries(COLUMNS_MAP).filter(
        ([key]) => !excludeTabs.includes(key as TTabName),
      ),
    ) as typeof COLUMNS_MAP;
  }, [excludeTabs]);

  // ------------------
  // Return everything
  // ------------------
  return {
    // active tab
    activeTab,
    setActiveTab: handleTabClick,

    // data & columns (filtered by excludeTabs)
    DATA_MAP,
    COLUMNS_MAP: COLUMNS_MAP_FILTERED,
    ordersCount,
    // pagination states for "History"
    historyPage,
    setHistoryPage,
    historyTotalPages,
    isTradeHistoryLoading,
    // pagination states for "Transfers"
    transfersPage,
    setTransfersPage,
    transfersTotalPages,
  };
}
