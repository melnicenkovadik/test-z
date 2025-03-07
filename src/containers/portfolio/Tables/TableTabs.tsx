import { clsx } from "clsx";
import Image from "next/image";
import React, { FC } from "react";

import { TTabName } from "@/containers/portfolio/Tables/tables.types";
import CloseAll from "@/shared/components/CloseAll";
import CloseAllCurrent from "@/shared/components/CloseAll/CloseAllCurrent";
import ManageColumns from "@/shared/components/ManageColumns/ManageColumns";
import AddNewAccountModal from "@/shared/components/modals/AddNewAccountModal";
import { Button } from "@/shared/components/ui/Button/button";
import Expand from "@/shared/components/ui/Expand";
import { useHistoryStoreOpen } from "@/shared/store/history.store";
import useUserStore from "@/shared/store/user.store";

import s from "./Table.module.scss";

interface ITableTabs {
  handleTabClick: (tab: TTabName) => void;
  activeTab: string;
  tabs: TTabName[];
  ordersLength: number;
  table: any;
  tableId: string;
  pagination: any | null | undefined;
  allClose?: boolean;
  isShorVersion?: boolean;
  hideArr?: boolean;
}

const TableTabs: FC<ITableTabs> = ({
  isShorVersion,
  handleTabClick,
  activeTab,
  tabs,
  ordersLength,
  table,
  tableId,
  pagination,
  allClose = false,
  hideArr = false,
}) => {
  const {
    isTradeHistoryLoading,
    handlePrevPage,
    historyPage,
    historyTotalPages,
    transfersPage,
    transfersTotalPages,
    handleNextPage,
  } = (pagination && pagination) || {};
  const { isHistoryOpen, toggleHistoryOpen } = useHistoryStoreOpen();
  const { user, isOverview } = useUserStore();

  const calcValues = (tab: TTabName) => {
    if (!user) {
      return "";
    }
    switch (tab) {
      case "Positions":
        return user.totalPositionsCount ? `(${user.totalPositionsCount})` : "";
      case "Orders":
        return ordersLength ? `(${ordersLength})` : "";
      default:
        return "";
    }
  };

  if (!user) {
    return null;
  }
  return (
    <Expand.Header className={s.tabs}>
      <div className={s.tabs__wrapper}>
        {tabs?.map((tab) => (
          <div
            key={tab}
            className={clsx(s.tab, { [s.tab__active]: tab === activeTab })}
            onClick={() => handleTabClick(tab)}
          >
            <div className={s.tab__name}>
              {tab} {calcValues(tab)}
            </div>
          </div>
        ))}
      </div>
      {!isShorVersion ? (
        <div className={s.actions}>
          <AddNewAccountModal />
          {!isOverview && <CloseAllCurrent />}
          {isOverview && allClose && <CloseAll />}
          <ManageColumns table={table} tableId={tableId} />
          {pagination &&
            ((activeTab === "History" && historyTotalPages > 1) ||
              (activeTab === "Transfers" && transfersTotalPages > 1)) && (
              <div className={s.pagination}>
                <Button
                  disabled={isTradeHistoryLoading}
                  onClick={handlePrevPage}
                >
                  <Image
                    src="/assets/icons/arr_prev.svg"
                    alt="prev"
                    width={16}
                    height={16}
                  />
                </Button>
                <span style={{ margin: "0 12px" }}>
                  {activeTab === "History"
                    ? `${historyPage} of ${historyTotalPages}`
                    : `${transfersPage} of ${transfersTotalPages}`}
                </span>
                <Button
                  disabled={isTradeHistoryLoading}
                  onClick={handleNextPage}
                >
                  <Image
                    src="/assets/icons/arr_next.svg"
                    alt="next"
                    width={16}
                    height={16}
                  />
                </Button>
              </div>
            )}
          {!hideArr && (
            <div onClick={toggleHistoryOpen} className={s.expand_icon}>
              <Image
                style={{
                  cursor: "pointer",
                  transform: !isHistoryOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
                src="/assets/icons/arrow_down.svg"
                alt="expand"
                width={16}
                height={16}
              />
            </div>
          )}
        </div>
      ) : null}
    </Expand.Header>
  );
};

export default TableTabs;
