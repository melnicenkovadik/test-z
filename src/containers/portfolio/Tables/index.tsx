"use client";

import { useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { useCallback, useEffect } from "react";

import {
  MANAGE_ACCOUNT_TABS,
  PORTFOLIO_TABS,
} from "@/containers/portfolio/Tables/helpers/columns";
import TableBody from "@/containers/portfolio/Tables/TableBody/TableBody";
import TableHeader from "@/containers/portfolio/Tables/TableHeader/TableHeader";
import { TTabName } from "@/containers/portfolio/Tables/tables.types";
import TableTabs from "@/containers/portfolio/Tables/TableTabs";
import { usePageContext } from "@/providers/PageContextProvider";
import { Desktop } from "@/shared/components/Device";
import MobileTable from "@/shared/components/MobileTable";
import useTableSettings from "@/shared/components/modals/TableSettingModal/useTableSettings";
import NoData from "@/shared/components/NoData/noData";
import Expand from "@/shared/components/ui/Expand";
import { useHistoryStoreOpen } from "@/shared/store/history.store";
import useUserStore from "@/shared/store/user.store";

import s from "./Table.module.scss";
import { useTableData } from "./useTableData";

const TableWrapper = ({ tableId = "portfolio" }) => {
  const isLoggedIn = useIsLoggedIn();
  const { accounts, isOverview } = useUserStore();
  const { isHistoryOpen, toggleHistoryOpen } = useHistoryStoreOpen();
  const tableSettings = useTableSettings((state) => state.settings[tableId]);
  const defaultHiddenColumns = tableSettings?.hiddenColumns || [];
  const defaultColumnOrder = tableSettings?.columnOrder || [];
  const { isMobile } = usePageContext();

  const {
    activeTab,
    setActiveTab,
    DATA_MAP,
    COLUMNS_MAP,
    // Pagination & state
    historyPage,
    setHistoryPage,
    historyTotalPages,
    isTradeHistoryLoading,
    transfersPage,
    setTransfersPage,
    transfersTotalPages,
  } = useTableData({
    firstTab: isOverview ? "Summary" : "Overview",
    excludeTabs: isOverview
      ? ["Overview", "Positions", "Orders", "History", "Transfers"]
      : ["Summary"],
  });

  const handleTabClick = useCallback(
    (tab: TTabName) => {
      if (tab === activeTab) return;
      if (!isHistoryOpen) {
        toggleHistoryOpen();
      }
      setActiveTab(tab);
    },
    [activeTab, isHistoryOpen, toggleHistoryOpen, setActiveTab, isOverview],
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
  }, [tableColumns, isOverview, defaultHiddenColumns]);

  const callOrder = useCallback(() => {
    const result = defaultColumnOrder.length
      ? defaultColumnOrder
      : tableColumns?.map((col) => col.id as string);
    return result;
  }, [tableColumns, defaultColumnOrder, isOverview]);

  const table = useReactTable({
    data: !isOverview ? tableData : accounts,
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
  const TABS = isOverview ? MANAGE_ACCOUNT_TABS : PORTFOLIO_TABS;
  const ACTIVE_TAB = isOverview ? "Summary" : activeTab;
  const PAGINATION = isOverview
    ? null
    : {
        isTradeHistoryLoading,
        handlePrevPage,
        historyPage,
        historyTotalPages,
        transfersPage,
        transfersTotalPages,
        handleNextPage,
      };

  const showTableHeader = tableData && tableData.length !== 0;

  return isLoggedIn ? (
    isMobile ? (
      <MobileTable
        isOverview={isOverview}
        DATA_MAP={DATA_MAP}
        TABS={TABS}
        handleTabClick={handleTabClick}
        ACTIVE_TAB={ACTIVE_TAB}
        tableId={tableId}
        table={table}
        PAGINATION={PAGINATION}
        showTableHeader={showTableHeader}
        tableData={tableData}
      />
    ) : (
      <Expand isOpen={isHistoryOpen} className={s.table} startHeight={37}>
        <TableTabs
          allClose={isOverview}
          ordersLength={DATA_MAP?.Orders?.length ?? 0}
          tabs={TABS}
          handleTabClick={handleTabClick}
          activeTab={ACTIVE_TAB}
          tableId={tableId}
          table={table}
          pagination={PAGINATION}
        />

        <Expand.Body tag="table" className={s.table_wrapper}>
          {!isOverview && (
            <Desktop>
              {showTableHeader && <TableHeader table={table} />}
            </Desktop>
          )}

          {isOverview && showTableHeader && <TableHeader table={table} />}

          {tableData && tableData.length === 0 ? (
            <NoData />
          ) : (
            <TableBody isManageAccounts={isOverview} table={table} />
          )}
        </Expand.Body>
      </Expand>
    )
  ) : null;
};

export default TableWrapper;
