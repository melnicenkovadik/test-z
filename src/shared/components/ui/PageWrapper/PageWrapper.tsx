"use client";

import React, { useEffect } from "react";

import { NotificationProvider } from "@/providers/notifications/NotificationContext";
import { NotificationsContainer } from "@/providers/notifications/NotificationsContainer";
import { usePageContext } from "@/providers/PageContextProvider";

import styles from "./PageWrapper.module.scss";

interface PageWrapperProps {
  children: React.ReactNode;
  isMobile: boolean;
  isMetaMask: boolean;
}

const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  isMobile = false,
  isMetaMask = false,
}) => {
  const { setIsMobile, setIsMetaMask } = usePageContext();

  useEffect(() => {
    setIsMobile(isMobile);
    setIsMetaMask(isMetaMask);
  }, [isMobile, isMetaMask]);

  return (
    <main className={styles.page_wrapper}>
      <NotificationProvider>
        {children}
        <NotificationsContainer autoCloseTime={10000} />
      </NotificationProvider>
    </main>
  );
};

export default PageWrapper;
