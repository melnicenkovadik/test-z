"use client";
import React from "react";

import s from "@/containers/portfolio/Tables/Table.module.scss";
import TableBody from "@/containers/portfolio/Tables/TableBody/TableBody";
import TableHeader from "@/containers/portfolio/Tables/TableHeader/TableHeader";
import TableTabs from "@/containers/portfolio/Tables/TableTabs";
import { Desktop } from "@/shared/components/Device";
import NoData from "@/shared/components/NoData/noData";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/shared/components/ui/Dialog";
import Expand from "@/shared/components/ui/Expand";

const MobileTradeTable = ({
  isOverview,
  DATA_MAP,
  TABS,
  handleTabClick,
  ACTIVE_TAB,
  tableId,
  table,
  PAGINATION,
  showTableHeader,
  tableData,
}: any) => {
  const [isOpenDialog, setIsOpenDialog] = React.useState(false);

  React.useEffect(() => {
    if (isOpenDialog) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpenDialog]);

  return (
    <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
      <DialogTrigger asChild>
        <div className={s.table_header}>
          <TableTabs
            isShorVersion
            allClose={isOverview}
            ordersLength={DATA_MAP?.Orders?.length ?? 0}
            tabs={TABS}
            handleTabClick={handleTabClick}
            activeTab={ACTIVE_TAB}
            tableId={tableId}
            table={table}
            pagination={PAGINATION}
          />
        </div>
      </DialogTrigger>
      <DialogContent>
        <Expand isOpen={true} className={s.table}>
          <TableTabs
            hideArr
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
      </DialogContent>
    </Dialog>
  );
};

export default MobileTradeTable;
