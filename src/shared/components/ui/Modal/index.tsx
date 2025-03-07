import clsx from "clsx";
import Image from "next/image";
import React, { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

import ClickOutside from "@/shared/components/ClickOutside";

import styles from "./Modal.module.scss";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: any;
  className?: string;
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps | any> = ({
  isOpen,
  showCloseButton = true,
  onClose,
  children,
  className,
}): any => {
  const preventOuterScroll = useCallback(() => {
    if (isOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [isOpen]);

  useEffect(() => {
    preventOuterScroll();
  }, [isOpen, preventOuterScroll]);

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.overlay}>
      <ClickOutside
        onClickOutside={onClose}
        exceptionClassNames={[styles.close_button]}
      >
        <div className={clsx(styles.modal, className)}>
          {showCloseButton ? (
            <Image
              className={styles.close_button}
              onClick={onClose}
              src="/assets/icons/close_modal.svg"
              alt="Close"
              width={12}
              height={12}
            />
          ) : null}
          {children}
        </div>
      </ClickOutside>
    </div>,
    // render modal in the html root element
    document.getElementsByTagName("html")[0],
  );
};

export default Modal;
