import { useState } from "react";

import CloseAllCurrentModalComponent from "@/shared/components/modals/CloseAllCurrentModal";
import { Button } from "@/shared/components/ui/Button/button";
import Modal from "@/shared/components/ui/Modal";
import useUserStore from "@/shared/store/user.store";

import s from "./CloseAll.module.scss";

const CloseAllCurrent = () => {
  const { user } = useUserStore();

  const [showModalCloseAll, setShowModalCloseAll] = useState(false);

  return (
    <>
      <Modal
        showCloseButton={true}
        className={s.connect_modal_wrapper}
        isOpen={showModalCloseAll}
        onClose={() => setShowModalCloseAll(false)}
      >
        <CloseAllCurrentModalComponent
          onSuccessful={() => setShowModalCloseAll(false)}
        />
      </Modal>
      <Button
        onClick={() => setShowModalCloseAll(true)}
        size="default"
        variant="primary"
        disabled={!user || !user?.positions || user?.positions?.length === 0}
        className={s.close_all}
      >
        Close All
      </Button>
    </>
  );
};

export default CloseAllCurrent;
