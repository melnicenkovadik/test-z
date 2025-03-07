"use client";
import React, { useEffect, useRef } from "react";

import { Notification } from "./notification_types/Notification";
import { INotification } from "./types";
import { useNotifications } from "./useNotifications";

interface NotificationsContainerProps {
  autoCloseTime?: number;
}

export const NotificationsContainer: React.FC<NotificationsContainerProps> = ({
  autoCloseTime = 10000,
}) => {
  const { notifications, removeNotification } = useNotifications();
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  useEffect(() => {
    const currentIds = notifications.map((n) => n.id);
    for (const [id, timerId] of timersRef.current.entries()) {
      if (!currentIds.includes(id)) {
        clearTimeout(timerId);
        timersRef.current.delete(id);
      }
    }

    notifications.forEach((n) => {
      if (!n.id) {
        return;
      } else {
        if (!timersRef.current.has(n.id)) {
          const timerId = setTimeout(() => {
            removeNotification(n?.id as string);
          }, autoCloseTime);
          timersRef.current.set(n.id, timerId);
        }
      }
    });
  }, [notifications, removeNotification, autoCloseTime]);

  const handleMouseEnter = (id: string) => {
    const timerId = timersRef.current.get(id);
    if (timerId) {
      clearTimeout(timerId);
      timersRef.current.delete(id);
    }
  };

  const handleMouseLeave = (id: string) => {
    const timerId = setTimeout(() => {
      removeNotification(id);
    }, autoCloseTime);
    timersRef.current.set(id, timerId);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 10,
      }}
    >
      {notifications.map((n: INotification) => (
        <Notification
          key={n.id}
          autoCloseTime={autoCloseTime}
          notification={n}
          onMouseEnter={() => handleMouseEnter(n.id as string)}
          onMouseLeave={() => handleMouseLeave(n.id as string)}
          onClick={() => removeNotification(n.id as string)}
        />
      ))}
    </div>
  );
};
