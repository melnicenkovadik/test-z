import Image from "next/image";
import React, { FC } from "react";

import TableSettingModal from "@/shared/components/modals/TableSettingModal";
import Modal from "@/shared/components/ui/Modal";

import s from "./ManageColumns.module.scss";

interface IManageColumns {
  tableId: string;
  table: any;
}

const ManageColumns: FC<IManageColumns> = ({ tableId, table }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <div
        onClick={() => setOpen((prev) => !prev)}
        className={s.manage_columns_action_btn}
      >
        <Image
          src="assets/icons/setting.svg"
          alt="edit"
          width={16}
          height={16}
        />
      </div>
      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <TableSettingModal
          table={table}
          tableId={tableId}
          onSuccessful={() => setOpen(false)}
        />
      </Modal>
    </>
  );
};

export default ManageColumns;
