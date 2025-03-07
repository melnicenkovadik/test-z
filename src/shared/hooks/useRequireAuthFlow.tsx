import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { useCallback, useState } from "react";

import ConnectModalComponent from "@/shared/components/modals/ConnectModal";
import s from "@/shared/components/modals/ConnectModal/ConnectModal.module.scss";
import Modal from "@/shared/components/ui/Modal";

export function useRequireAuthFlow({
  showCustomModal = true,
}: {
  showCustomModal?: boolean;
}) {
  const { setShowAuthFlow } = useDynamicContext();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const isLoggedIn = useIsLoggedIn();

  const requireAuth = useCallback(() => {
    console.log("isLoggedIn", isLoggedIn);
    if (!isLoggedIn) {
      if (showCustomModal) {
        setShowAuthModal(true);
      } else {
        setShowAuthFlow(true);
      }
      return true;
    }
    return false;
  }, [isLoggedIn, setShowAuthFlow]);

  const ConnectModal = () => {
    return (
      <Modal
        showCloseButton={false}
        className={s.connect_modal_wrapper}
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      >
        <ConnectModalComponent onSuccessful={() => setShowAuthModal(false)} />
      </Modal>
    );
  };
  return { requireAuth, ConnectModal };
}
