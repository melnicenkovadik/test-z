export interface INotification {
  id?: string;
  message?: string;
  type?:
    | "info"
    | "success"
    | "error"
    | "warning"
    | "pending"
    | "long"
    | "boost"
    | "closed"
    | "withdrawal";
  title?: any;
  subTitle?: string;
  amount?: string;
  executionPrice?: string;
  statusText?: string;
  icon?: any;
}
export interface NotificationContextValue {
  notifications: INotification[];
  addNotification: (props: INotification) => string;
  removeNotification: (id: string) => void;
}
