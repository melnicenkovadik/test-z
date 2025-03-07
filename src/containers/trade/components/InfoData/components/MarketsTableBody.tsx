import { flexRender, Table } from "@tanstack/react-table";
import { clsx } from "clsx";
import React, { FC } from "react";
import { v4 as uuid } from "uuid";

import { useMarketStore } from "@/shared/store/useMarketStore";
import { isProduction } from "@/shared/utils/project-env";

import s from "./MarketsTableBody.module.scss";
import { hasIcon } from "../../../../../../public/assets/icons/coins/avalible_icons";

interface IMarketsTableBody<TData> {
  table: Table<TData> | null;
  handleSelectMarket: (market: any) => void;
}

const MarketsTableBody: FC<IMarketsTableBody<any>> = ({
  table,
  handleSelectMarket,
}) => {
  const { selectedMarket } = useMarketStore();
  if (!table) {
    return null;
  }

  return (
    <tbody className={s.table_body}>
      {table
        ?.getRowModel()
        ?.rows?.sort((a, b) => {
          if (selectedMarket?.ticker === a.original.ticker) {
            return -1;
          }
          if (selectedMarket?.ticker === b.original.ticker) {
            return 1;
          }
          return 0;
        })
        ?.map((row) => {
          const isSelected = selectedMarket?.ticker === row.original.ticker;
          const id_tr = uuid();
          if (isProduction && !hasIcon(row.original.quoteToken)) {
            return null;
          }
          return (
            <tr
              key={`${id_tr}-${row.id}`}
              onClick={() =>
                handleSelectMarket({
                  value: row.original,
                  label: row.original.ticker,
                  icon: row.original.quoteToken || undefined,
                })
              }
              className={clsx(s.table_body_row)}
            >
              <div
                className={clsx({
                  [s.selected]: isSelected,
                })}
              >
                {row.getVisibleCells()?.map((cell) => {
                  const id_td = uuid();
                  return (
                    <td
                      key={`${cell.id}-${cell.column.id}-${cell.row.id}-${id_td}`}
                      className={clsx(s.table_body_item, {
                        [s.ticker]: cell.column.id === "ticker",
                        [s.price]: cell.column.id === "markPrice",
                        [s.change]: cell.column.id === "priceChange24H",
                        [s.volume]: cell.column.id === "volume24h",
                        [s.funding]: cell.column.id === "fundingRate",
                        [s.skew]: cell.column.id === "skew",
                        [s.liquidity]: cell.column.id === "marketliquidity",
                        [s.open_interest]:
                          cell.column.id === "marketopenInterest",
                      })}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  );
                })}
              </div>
            </tr>
          );
        })}
    </tbody>
  );
};

export default MarketsTableBody;
