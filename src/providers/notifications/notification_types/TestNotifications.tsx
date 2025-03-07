"use client";
import React from "react";

import { useNotifications } from "@/providers/notifications/useNotifications";

export const TestNotifications: React.FC = () => {
  const { addNotification } = useNotifications();

  const handleAddLong = () => {
    addNotification({
      message: "60 BTC",
      type: "info",
      title: "BTC",
      subTitle: "Perpetual",
      statusText: "// Long",
      amount: "60 BTC",
      executionPrice: "58,095,91 rUSD",
      icon: "₿",
    });
  };

  const handleAddBoost = () => {
    addNotification({
      message: "233 XP",
      type: "boost",
      title: "BTC",
      subTitle: "Perpetual",
      statusText: "// Boost 8x",
      amount: "233 XP",
      icon: "₿",
    });
  };

  const handleAddPending = () => {
    addNotification({
      message: "70 BTC",
      type: "warning",
      title: "BTC",
      subTitle: "Perpetual",
      statusText: "// Pending",
      amount: "70 BTC",
      executionPrice: "≈58,095,91 rUSD",
      icon: "₿",
    });
  };

  const handleAddLongWithUser = () => {
    addNotification({
      message: "60 BTC",
      type: "info",
      title: "BTC",
      subTitle: "Perpetual",
      statusText: "// Long",
      amount: "60 BTC",
      executionPrice: "58,095,91 rUSD",
      icon: "₿",
    });
  };

  const handleAddGlobalWithdrawLimitReached = () => {
    addNotification({
      title: "GlobalWithdrawLimitReached",
      type: "error",
      statusText: "// Error",
    });
  };

  const handleAddPositionClosed = () => {
    addNotification({
      message: "60 BTC",
      type: "info",
      title: "BTC",
      subTitle: "Perpetual",
      statusText: "// Position closed",
      amount: "60 BTC",
      icon: "₿",
    });
  };

  const handleAddWithdrawalPending = () => {
    addNotification({
      message: "10 BTC",
      title: "BTC",
      subTitle: "Withdrawal",
      statusText: "// Withdrawal Pending",
      amount: "10 BTC",
      executionPrice: "",
      icon: "₿",
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Test Notifications with Buttons</h1>
      <p>
        Ниже представлены кнопки для добавления различных типов нотификаций.
      </p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxWidth: "300px",
        }}
      >
        <button onClick={handleAddLong}>Add Long Notification</button>
        <button onClick={handleAddBoost}>Add Boost 8x Notification</button>
        <button onClick={handleAddPending}>Add Pending Notification</button>
        <button onClick={handleAddLongWithUser}>
          Add Long with User Notification
        </button>
        <button onClick={handleAddGlobalWithdrawLimitReached}>
          Add Error (GlobalWithdrawLimitReached)
        </button>
        <button onClick={handleAddPositionClosed}>
          Add Position Closed Notification
        </button>
        <button onClick={handleAddWithdrawalPending}>
          Add Withdrawal Pending Notification
        </button>
      </div>
    </div>
  );
};
