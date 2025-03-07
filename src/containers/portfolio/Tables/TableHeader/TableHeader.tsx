import { flexRender, Table } from "@tanstack/react-table";
import { clsx } from "clsx";
import React, { FC } from "react";
import { v4 as uuid } from "uuid";

import s from "./TableHeader.module.scss";

interface ITableHeader<TData> {
  table: Table<TData> | null;
}

const TableHeader: FC<ITableHeader<any>> = ({ table }) => {
  if (!table) {
    return null;
  }
  return (
    <thead className={s.table_header}>
      {table.getHeaderGroups()?.map((headerGroup) => {
        const id_tr = uuid();

        return (
          <tr key={`${headerGroup.id}-${headerGroup.headers?.length}-${id_tr}`}>
            {headerGroup.headers.map((header) => {
              const id_th = uuid();

              return (
                <th
                  key={`${header.id}-${header.column.id}-${headerGroup.id}-${id_th}`}
                  className={clsx(s.table_header_item, {
                    [s.action_close]: header.id?.includes("ActionClose"),
                  })}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              );
            })}
          </tr>
        );
      })}
    </thead>
  );
};

export default TableHeader;
