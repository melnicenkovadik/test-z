import { create } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";

export interface TableSettings {
  columnOrder: string[];
  hiddenColumns: string[];
}

interface TableSettingsStore {
  settings: Record<string, TableSettings>;
  setTableSettings: (tableId: string, settings: TableSettings) => void;
  updateTableSettings: (
    tableId: string,
    partial: Partial<TableSettings>,
  ) => void;
}

const useTableSettings = create<TableSettingsStore>()(
  persist<TableSettingsStore>(
    (set) => ({
      settings: {},
      setTableSettings: (tableId, settings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            [tableId]: settings,
          },
        })),
      updateTableSettings: (tableId, partial) =>
        set((state) => ({
          settings: {
            ...state.settings,
            [tableId]: {
              ...(state.settings[tableId] || {
                columnOrder: [],
                hiddenColumns: [],
              }),
              ...partial,
            },
          },
        })),
    }),
    {
      name: "table-settings-store",
    } as PersistOptions<TableSettingsStore>,
  ),
);

export default useTableSettings;
