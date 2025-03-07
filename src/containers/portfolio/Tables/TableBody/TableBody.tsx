import { flexRender, Table } from "@tanstack/react-table";
import { clsx } from "clsx";
import { JsonRpcSigner } from "ethers";
import Image from "next/image";
import React, { FC, useState } from "react";
import { v4 as uuid } from "uuid";
import { useChainId } from "wagmi";

import { useNotifications } from "@/providers/notifications/useNotifications";
import { cancelConditionalOrderService } from "@/services/conditional-orders/services";
import { Desktop, Mobile } from "@/shared/components/Device";
import CloseAllSelectedPositionsModalComponent from "@/shared/components/modals/CloseAllSelectedPositionsModal";
import ClosePositionModalComponent from "@/shared/components/modals/ClosePositionModal";
import EditNameModal from "@/shared/components/modals/EditNameModal";
import EditSLxTPModal from "@/shared/components/modals/EditSLxTPModal";
import Modal from "@/shared/components/ui/Modal";
import { useEthersSigner } from "@/shared/hooks/walletUtils";
import useUserStore from "@/shared/store/user.store";

import s from "./TableBody.module.scss";

interface ITableBody<TData> {
  table: Table<TData> | null;
  isManageAccounts?: boolean;
}

const TableBody: FC<ITableBody<any>> = ({ table, isManageAccounts }) => {
  const { user, isOverview, toggleIsOverview, setUser } = useUserStore();
  const { addNotification } = useNotifications();
  const currentChain = useChainId();

  const [closePosData, setClosePosData] = useState<any>(null);
  const handleClosePos = () => {
    setClosePosData(null);
  };
  const [closeAllPosData, setCloseAllPosData] = useState<any>(null);
  const handleCloseAllPos = () => {
    setCloseAllPosData(null);
  };
  // const [closeOrderData, setCloseOrderData] = useState<any>(null);
  // const handleCloseOrder = () => {
  //   setCloseOrderData(null);
  // };
  // Состояния для модального окна
  const [isEditSLxTPModalOpen, setIsEditSLxTPModalOpen] = useState(false);
  const [editingSlTpData, setEditingSlTpData] = useState<any>(null);
  const handleCloseSLxTP = () => {
    setIsEditSLxTPModalOpen(false);
    setEditingSlTpData(null);
  };
  // Редактирование имени аккаунта
  const [isEditAccountNameModalOpen, setIsEditAccountNameModalOpen] =
    useState(false);
  const [editingAccountNameData, setEditingAccountNameData] =
    useState<any>(null);

  const onSuccessEditAccountName = () => {
    setIsEditAccountNameModalOpen(false);
    setEditingAccountNameData(null);
  };
  // Получаем signer для работы с ethers
  const signer = useEthersSigner({ chainId: currentChain });

  if (!currentChain || !table || !user) {
    return null;
  }

  // Обработчик успешного редактирования SL/TP
  const onSuccessfulEditSlTp = () => {
    setIsEditSLxTPModalOpen(false);
    setEditingSlTpData(null);
  };

  // Обработчик закрытия условного ордера
  const closeConditionalOrderHandler = async ({
    orderId,
    signer,
  }: {
    orderId: string;
    signer: JsonRpcSigner;
    marketId: string;
    marginAccountId: number;
  }) => {
    if (!signer) return;

    try {
      // @ts-ignore
      await cancelConditionalOrderService({ orderId, signer });

      addNotification({
        title: "Conditional Order",
        message: "Order cancelled",
        type: "info",
        statusText: "// Order cancelled",
      });
    } catch (error: any) {
      console.error("close position error", error);
      addNotification({
        title:
          error?.message ||
          error?.response?.data?.message ||
          "Something went wrong",
        type: "error",
        statusText: "// Error",
      });
    }
  };

  // Обработчик смены аккаунта (для режима управления аккаунтами)
  const handleAccountChange = (selectedOption: any) => {
    if (selectedOption?.id === user?.id) return;

    const newAccount = {
      account: user?.account,
      ...selectedOption,
    };

    console.log("newAccount", newAccount);

    if (isOverview) {
      toggleIsOverview();
    }
    setUser(newAccount);
  };

  // Унифицированный обработчик клика по содержимому ячейки
  const handleCellClick = async (
    cell: any,
    row: any,
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    // Если это действие "Close All" в режиме управления аккаунтами
    if (isManageAccounts && cell.id.includes("summaryActionCloseAll")) {
      const button = event.target as HTMLButtonElement;
      console.log("action_edit2", button);
      if (button?.id.includes("action_close")) {
        // await closeAll(row.original);
        setCloseAllPosData(row.original);
        return;
      }
      if (button?.id.includes("action_edit")) {
        setIsEditAccountNameModalOpen(true);
        setEditingAccountNameData(row.original);
        return;
      }
      return;
    }

    // Если режим управления аккаунтами – переключаем аккаунт
    if (isManageAccounts) {
      handleAccountChange(cell.row.original);
      return;
    }

    // Если это действие закрытия условного ордера (ordersHistoryActionClose)
    if (cell.id?.includes("ordersHistoryActionClose")) {
      console.log("ordersHistoryActionClose", cell);
      const orderId = cell.row.original?.orderId;
      if (!orderId || !signer) return;
      const { market, marginAccountId } = row.original;
      await closeConditionalOrderHandler({
        orderId,
        signer,
        marketId: market.id,
        marginAccountId,
      });
      return;
    }

    // Если это действие закрытия позиции (ActionClose)
    if (cell.id?.includes("ActionClose")) {
      console.log("ActionClose", cell);
      console.log("ActionClose", row);
      const { market, accountId } = row.original;
      const position = cell.row.original;
      setClosePosData({
        market,
        accountId,
        position,
      });
      return;
    }
  };

  // Функция для рендеринга содержимого ячейки
  const renderCellContent = (cell: any, row: any) => {
    const isConditionalOrdersInfo = cell.column.id?.includes(
      "positionsConditionalOrdersInfo",
    );

    return (
      <div
        className={s.table_body_item_content}
        onClick={(e) => handleCellClick(cell, row, e)}
      >
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
        {isConditionalOrdersInfo && (
          <button
            className={s.settings}
            onClick={(e) => {
              e.stopPropagation();
              setIsEditSLxTPModalOpen(true);
              setEditingSlTpData(cell.row.original);
            }}
          >
            <Image
              src="assets/icons/setting.svg"
              alt="edit"
              width={16}
              height={16}
            />
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Десктоп-версия: стандартная таблица */}
      <Modal
        isOpen={isEditSLxTPModalOpen && !!editingSlTpData}
        onClose={handleCloseSLxTP}
      >
        <EditSLxTPModal
          onSuccessful={onSuccessfulEditSlTp}
          data={editingSlTpData}
        />
      </Modal>
      <Modal
        isOpen={isEditAccountNameModalOpen && !!editingAccountNameData}
        onClose={onSuccessEditAccountName}
      >
        <EditNameModal
          onSuccessful={onSuccessEditAccountName}
          data={editingAccountNameData}
        />
      </Modal>
      <Modal isOpen={!!closePosData} onClose={handleClosePos}>
        <ClosePositionModalComponent
          onSuccessful={handleClosePos}
          data={closePosData}
        />
      </Modal>
      <Modal isOpen={!!closeAllPosData} onClose={handleCloseAllPos}>
        <CloseAllSelectedPositionsModalComponent
          onSuccessful={handleCloseAllPos}
          data={closeAllPosData}
        />
      </Modal>
      <Desktop>
        <tbody className={s.table_body}>
          {table?.getRowModel().rows.map((row) => {
            const rowKey = `${uuid()}-${row.id}`;
            return (
              <tr key={rowKey}>
                {row.getVisibleCells().map((cell: any) => {
                  const cellKey = `${cell.id}-${cell.column.id}-${row.id}-${uuid()}`;
                  return (
                    <td
                      key={cellKey}
                      className={clsx(s.table_body_item, {
                        [s.is_manage_accounts_row]: isManageAccounts,
                        [s.action_close]:
                          cell.id.includes("ActionClose") ||
                          cell.id.includes("ordersHistoryActionClose") ||
                          cell.id.includes("summaryActionCloseAll"),
                      })}
                    >
                      {renderCellContent(cell, row)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </Desktop>

      <Mobile>
        <div className={s.mobileTableContainer}>
          {table?.getRowModel().rows.map((row) => {
            const rowKey = `${uuid()}-${row.id}`;
            return (
              <div key={rowKey} className={s.mobileCard}>
                <div className={s.mobileCardGrid}>
                  {row.getVisibleCells().map((cell: any) => {
                    const currentColHeader = cell?.column?.columnDef?.header;
                    const cellKey = `${cell.id}-${cell.column.id}-${row.id}-${uuid()}`;

                    return (
                      <div key={cellKey} className={s.mobileCardItem}>
                        <span className={s.mobileCardItemHeader}>
                          {currentColHeader}
                        </span>
                        {renderCellContent(cell, row)}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Mobile>
    </>
  );
};

export default TableBody;
