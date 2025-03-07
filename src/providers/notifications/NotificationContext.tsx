"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { v4 as uuid } from "uuid";

import { INotification, NotificationContextValue } from "./types";

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined,
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<INotification[]>([]);

  const addNotification = useCallback((props: INotification) => {
    if (props?.type?.includes("error")) {
      console.error(`ERROR: ${props.message || props.title}`);
    }
    const id = uuid();
    setNotifications((prev) => [...prev, { id, ...props }]);
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider",
    );
  }
  return context;
};
