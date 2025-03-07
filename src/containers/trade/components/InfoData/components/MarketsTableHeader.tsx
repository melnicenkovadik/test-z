// FILE: src/app/trade/portfolio/InfoData/portfolio/MarketsTableHeader.tsx

import { flexRender, Table } from "@tanstack/react-table";
import { clsx } from "clsx";
import Image from "next/image";
import React, { FC } from "react";
import { v4 as uuid } from "uuid";

import s from "./MarketsTableHeader.module.scss";

interface IMarketsTableHeader<TData> {
  table: Table<TData> | null;
  isTokenMode: boolean;
  setIsTokenMode: (val: boolean) => void;
}

const MarketsTableHeader: FC<IMarketsTableHeader<any>> = ({
  table,
  isTokenMode,
  setIsTokenMode,
}) => {
  if (!table) return null;

  return (
    <thead className={s.table_header}>
      <tr>
        <th colSpan={table.getHeaderGroups()[0]?.headers?.length || 1}>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: "8px 0",
            }}
          >
            <button
              onClick={() => setIsTokenMode(!isTokenMode)}
              style={{
                cursor: "pointer",
                border: "1px solid var(--Base-300)",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            >
              {isTokenMode ? "Show in USD" : "Show in TOKEN"}
            </button>
          </div>
        </th>
      </tr>

      {table.getHeaderGroups().map((headerGroup) => {
        const id_tr = uuid();
        return (
          <tr key={`${headerGroup.id}-${headerGroup.headers?.length}-${id_tr}`}>
            {headerGroup.headers.map((header) => {
              const id_th = uuid();
              const canSort = header.column.getCanSort();
              const isSorted = header.column.getIsSorted();
              let sortIndicator = null;
              if (canSort) {
                if (!isSorted) {
                  sortIndicator = (
                    <Image
                      className={s.sort_icon}
                      src="/assets/icons/sort_arr.svg"
                      alt="sort"
                      width={16}
                      height={16}
                    />
                  );
                } else if (isSorted === "asc") {
                  sortIndicator = (
                    <Image
                      className={s.sort_icon_top}
                      src="/assets/icons/arr_to_top.svg"
                      alt="sort"
                      width={24}
                      height={24}
                    />
                  );
                } else if (isSorted === "desc") {
                  sortIndicator = (
                    <Image
                      className={s.sort_icon_top}
                      src="/assets/icons/arr_to_down.svg"
                      alt="sort"
                      width={24}
                      height={24}
                    />
                  );
                }
              }

              return (
                <th
                  key={`${header.id}-${header.column.id}-${headerGroup.id}-${id_th}`}
                  className={clsx(s.table_header_item, {
                    [s.ticker]: header.column.id?.includes("ticker"),
                    [s.price]: header.column.id?.includes("markPrice"),
                    [s.change]: header.column.id?.includes("Change"),
                    [s.volume]: header.column.id?.includes("volume"),
                    [s.funding]: header.column.id?.includes("fundingRate"),
                    [s.skew]: header.column.id?.includes("skew"),
                    [s.open_interest]:
                      header.column.id?.includes("marketopenInterest"),
                    [s.liquidity]:
                      header.column.id?.includes("marketliquidity"),
                  })}
                  onClick={
                    canSort
                      ? header.column.getToggleSortingHandler()
                      : undefined
                  }
                  style={{
                    cursor: canSort ? "pointer" : "default",
                  }}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                  {sortIndicator}
                </th>
              );
            })}
          </tr>
        );
      })}
    </thead>
  );
};

export default MarketsTableHeader;
