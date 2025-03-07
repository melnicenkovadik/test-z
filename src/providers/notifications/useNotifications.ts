import { useNotificationContext } from "./NotificationContext";

export function useNotifications() {
  const { notifications, addNotification, removeNotification } =
    useNotificationContext();
  return { notifications, addNotification, removeNotification };
}
