"use client";
import { useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useCallback, useEffect } from "react";

import { TRADE_TABS } from "@/containers/portfolio/Tables/helpers/columns";
import s from "@/containers/portfolio/Tables/Table.module.scss";
import TableBody from "@/containers/portfolio/Tables/TableBody/TableBody";
import TableHeader from "@/containers/portfolio/Tables/TableHeader/TableHeader";
import { TTabName } from "@/containers/portfolio/Tables/tables.types";
import TableTabs from "@/containers/portfolio/Tables/TableTabs";
import { useTableData } from "@/containers/portfolio/Tables/useTableData";
import { usePageContext } from "@/providers/PageContextProvider";
import { Desktop } from "@/shared/components/Device";
import MobileTradeTable from "@/shared/components/MobileTable/MobileTradeTable";
import useTableSettings from "@/shared/components/modals/TableSettingModal/useTableSettings";
import NoData from "@/shared/components/NoData/noData";
import Expand from "@/shared/components/ui/Expand";
import { useHistoryStoreOpen } from "@/shared/store/history.store";

const TradeTable = ({ tableId = "trade_table" }) => {
  const isLoggedIn = useIsLoggedIn();
  const { isHistoryOpen, toggleHistoryOpen } = useHistoryStoreOpen();
  // @ts-ignore
  const tableSettings = useTableSettings((state) => state.settings[tableId]);
  const defaultHiddenColumns = tableSettings?.hiddenColumns || [];
  const defaultColumnOrder = tableSettings?.columnOrder || [];
  const { isMobile } = usePageContext();

  const {
    activeTab,
    setActiveTab,
    DATA_MAP,
    COLUMNS_MAP,
    historyPage,
    ordersCount,
    setHistoryPage,
    historyTotalPages,
    isTradeHistoryLoading,
    transfersPage,
    setTransfersPage,
    transfersTotalPages,
  } = useTableData({
    excludeTabs: ["Overview", "Transfers", "Summary"],
  });

  const handleTabClick = useCallback(
    (tab: TTabName) => {
      if (tab === activeTab) return;
      if (!isHistoryOpen) {
        toggleHistoryOpen();
      }
      setActiveTab(tab);
    },
    [activeTab, isHistoryOpen, toggleHistoryOpen, setActiveTab],
  );

  const tableData = isLoggedIn ? (DATA_MAP[activeTab] ?? []) : [];
  const tableColumns = COLUMNS_MAP[activeTab] ?? [];
  const callVisibleColumns = useCallback(() => {
    const result = tableColumns.reduce(
      (acc, col) => {
        // @ts-ignore
        acc[col.accessorKey as string] = !defaultHiddenColumns.includes(
          // @ts-ignore
          col.accessorKey as string,
        );
        return acc;
      },
      {} as Record<string, boolean>,
    );
    return result;
  }, [tableColumns, defaultHiddenColumns]);

  const callOrder = useCallback(() => {
    const result = defaultColumnOrder.length
      ? defaultColumnOrder
      : tableColumns.map((col) => col.id as string);
    return result;
  }, [tableColumns, defaultColumnOrder]);

  const table = useReactTable({
    data: tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnVisibility: callVisibleColumns(),
      columnOrder: callOrder(),
    },
  });
  useEffect(() => {
    if (tableSettings?.columnOrder && tableSettings.columnOrder.length) {
      table.setColumnOrder(tableSettings.columnOrder);
    }
  }, [tableSettings?.columnOrder, table, tableSettings?.hiddenColumns]);

  const handlePrevPage = () => {
    if (activeTab === "History") {
      if (historyPage > 1) {
        setHistoryPage(historyPage - 1);
      }
    } else if (activeTab === "Transfers") {
      if (transfersPage > 1) {
        setTransfersPage(transfersPage - 1);
      }
    }
  };

  const handleNextPage = () => {
    if (activeTab === "History") {
      if (historyPage < historyTotalPages) {
        setHistoryPage(historyPage + 1);
      }
    } else if (activeTab === "Transfers") {
      if (transfersPage < transfersTotalPages) {
        setTransfersPage(transfersPage + 1);
      }
    }
  };

  return isLoggedIn ? (
    isMobile ? (
      <MobileTradeTable
        isOverview={false}
        DATA_MAP={DATA_MAP}
        TABS={TRADE_TABS}
        handleTabClick={handleTabClick}
        ACTIVE_TAB={activeTab}
        tableId={tableId}
        table={table}
        PAGINATION={{
          isTradeHistoryLoading,
          handlePrevPage,
          historyPage,
          historyTotalPages,
          transfersPage,
          transfersTotalPages,
          handleNextPage,
        }}
        showTableHeader={tableData && tableData.length !== 0}
        tableData={tableData}
      />
    ) : (
      <Expand isOpen={isHistoryOpen} className={s.table} startHeight={37}>
        <TableTabs
          ordersLength={ordersCount}
          tabs={TRADE_TABS}
          handleTabClick={handleTabClick}
          activeTab={activeTab}
          table={table}
          tableId={tableId}
          pagination={{
            isTradeHistoryLoading,
            handlePrevPage,
            historyPage,
            historyTotalPages,
            transfersPage,
            transfersTotalPages,
            handleNextPage,
          }}
        />

        <Expand.Body tag="table" className={s.table_wrapper}>
          <Desktop>
            {tableData && tableData.length === 0 ? null : (
              <TableHeader table={table} />
            )}
          </Desktop>
          {tableData && tableData.length === 0 ? (
            <NoData />
          ) : (
            <TableBody table={table} />
          )}
        </Expand.Body>
      </Expand>
    )
  ) : null;
};

export default TradeTable;
