"use client";
import clsx from "clsx";
import Image from "next/image";
import React, { useEffect, useState } from "react";

import useTableSettings from "@/shared/components/modals/TableSettingModal/useTableSettings";
import Block from "@/shared/components/ui/Block";
import { Button } from "@/shared/components/ui/Button/button";
import { Checkbox } from "@/shared/components/ui/Checkbox";

import s from "./TableSettingModal.module.scss";

export interface ColumnOption {
  id: string;
  label: string;
}

interface ITableSettingModal {
  tableId: string;
  onSuccessful: () => void;
  table: any;
}

const TableSettingModal: React.FC<ITableSettingModal> = ({
  table,
  tableId,
  onSuccessful,
}) => {
  const [ALL_COLUMNS, setALL_COLUMNS] = useState<ColumnOption[]>([]);
  const savedSettings = useTableSettings((state) => state.settings[tableId]);
  const updateTableSettings = useTableSettings(
    (state) => state.updateTableSettings,
  );

  const [columnOrder, setColumnOrder] = useState<string[]>(
    savedSettings?.columnOrder || ALL_COLUMNS.map((col) => col.id),
  );
  const [hiddenColumns, setHiddenColumns] = useState<string[]>(
    savedSettings?.hiddenColumns || [],
  );

  // Состояния для drag & drop
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    // @ts-ignore
    const all = table.getAllLeafColumns().map((column) => {
      return {
        id: column.id,
        label: column?.columnDef?.header,
      };
    });
    setALL_COLUMNS(all);
    // @ts-ignore
    setColumnOrder(all.map((col) => col.id));
  }, [table]);

  const toggleColumnVisibility = (colId: string) => {
    setHiddenColumns((prev) =>
      prev.includes(colId)
        ? prev.filter((id) => id !== colId)
        : [...prev, colId],
    );
  };

  const handleSave = () => {
    updateTableSettings(tableId, { columnOrder, hiddenColumns });
    onSuccessful();
  };

  const handleDragStart =
    (index: number) => (event: React.DragEvent<HTMLDivElement>) => {
      setDraggedItemIndex(index);
      event.dataTransfer.effectAllowed = "move";
      // Сохраняем индекс в dataTransfer (опционально)
      event.dataTransfer.setData("text/plain", String(index));
    };

  const handleDragOver =
    (index: number) => (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault(); // Обязательно для разрешения сброса
      setDragOverIndex(index);
    };

  const handleDragLeave = () => () => {
    setDragOverIndex(null);
  };

  const handleDrop =
    (index: number) => (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (draggedItemIndex === null) return;
      const newOrder = [...columnOrder];
      // Удаляем перетаскиваемый элемент
      const [removed] = newOrder.splice(draggedItemIndex, 1);
      // Вставляем его на позицию сброса
      newOrder.splice(index, 0, removed);
      setColumnOrder(newOrder);
      setDraggedItemIndex(null);
      setDragOverIndex(null);
    };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
    setDragOverIndex(null);
  };

  return (
    <Block className={s.deposit} opacityLvl={5}>
      <div className={s.deposit__header}>
        <h2 className={s.deposit__title}>Manage Table Columns</h2>
        <p className={s.deposit__description}>
          Easily select and adjust the columns in your table view.
        </p>
      </div>
      <div className={s.columns_list}>
        {ALL_COLUMNS?.sort(
          (a, b) => columnOrder.indexOf(a.id) - columnOrder.indexOf(b.id),
        )?.map((col, index) => (
          <div
            key={col.id}
            draggable
            onDragStart={handleDragStart(index)}
            onDragOver={handleDragOver(index)}
            onDragLeave={handleDragLeave()}
            onDrop={handleDrop(index)}
            onDragEnd={handleDragEnd}
            onClick={() => toggleColumnVisibility(col.id)}
            className={clsx(s.column_item, {
              [s.column_item_selected]: !hiddenColumns.includes(col.id),
              [s.column_item_dragover]: index === dragOverIndex,
            })}
          >
            <Checkbox
              key={col.id}
              label={col.label}
              checked={!hiddenColumns.includes(col.id)}
              onCheckedChange={(e) => {
                // @ts-ignore
                e?.preventDefault();
                toggleColumnVisibility(col.id);
              }}
              inputClassName={s.column_item__checkbox}
              labelClassName={s.column_item__label}
            />
            <div className={s.column_item__actions}>
              <div className={s.column_item__action}>
                <Image
                  src="assets/icons/arr_up_and_down.svg"
                  alt="Move down"
                  width={20}
                  height={20}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button onClick={handleSave} variant="white" className={s.action_button}>
        Save
      </Button>
    </Block>
  );
};

export default TableSettingModal;
