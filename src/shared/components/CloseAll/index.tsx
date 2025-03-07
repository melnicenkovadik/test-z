import { useState } from "react";

import CloseAllModalComponent from "@/shared/components/modals/CloseAllModal";
import { Button } from "@/shared/components/ui/Button/button";
import Modal from "@/shared/components/ui/Modal";

import s from "./CloseAll.module.scss";

const CloseAll = () => {
  const [showModalCloseAll, setShowModalCloseAll] = useState(false);

  return (
    <>
      <Modal
        showCloseButton={true}
        className={s.connect_modal_wrapper}
        isOpen={showModalCloseAll}
        onClose={() => setShowModalCloseAll(false)}
      >
        <CloseAllModalComponent
          onSuccessful={() => setShowModalCloseAll(false)}
        />
      </Modal>
      <Button
        onClick={() => setShowModalCloseAll(true)}
        size="default"
        variant="primary"
        className={s.close_all}
      >
        Close All
      </Button>
    </>
  );
};

export default CloseAll;
