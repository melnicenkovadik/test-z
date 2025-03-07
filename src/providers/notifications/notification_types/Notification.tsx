"use client";
import { clsx } from "clsx";
import React, { useEffect, useState } from "react";

import { INotification } from "../types";
import styles from "./Notification.module.scss";

interface NotificationProps {
  notification: INotification;
  autoCloseTime?: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}

export const Notification: React.FC<NotificationProps> = React.memo(
  ({
    notification,
    autoCloseTime = 10000,
    onMouseEnter,
    onMouseLeave,
    onClick,
  }) => {
    const {
      message,
      type,
      title,
      subTitle,
      statusText,
      amount,
      executionPrice,
      icon,
    } = notification;

    const [progressWidth, setProgressWidth] = useState("100%");
    const [transitionEnabled, setTransitionEnabled] = useState(true);

    useEffect(() => {
      const rAF = requestAnimationFrame(() => {
        setProgressWidth("0%");
      });
      return () => cancelAnimationFrame(rAF);
    }, []);

    const onMouseEnterHandler = () => {
      setTransitionEnabled(false);
      setProgressWidth("100%");
      onMouseEnter?.();
    };

    const onMouseLeaveHandler = () => {
      requestAnimationFrame(() => {
        setTransitionEnabled(true);
        setProgressWidth("0%");
      });
      onMouseLeave?.();
    };
    return (
      <div
        className={`${styles.notification} ${styles?.[type ?? "default"]}`}
        onMouseEnter={onMouseEnterHandler}
        onMouseLeave={onMouseLeaveHandler}
        onClick={onClick}
      >
        <div className={styles.header}>
          <div className={styles.title_container}>
            {!!icon ? (
              <img
                src={icon}
                alt="icon"
                width={20}
                height={20}
                className={styles.icon}
              />
            ) : null}
            {title ? (
              <span className={clsx(styles.title)}>{title || message}</span>
            ) : null}
            {subTitle ? (
              <span
                className={clsx(styles.sub_title, {
                  [styles.sub_title_red]: subTitle?.toLowerCase() === "short",
                  [styles.sub_title_green]: subTitle?.toLowerCase() === "long",
                })}
              >
                {subTitle}
              </span>
            ) : null}
          </div>
          {statusText ? (
            <div className={styles.status_text}>{statusText}</div>
          ) : null}
        </div>
        {amount || executionPrice ? (
          <div className={styles.body}>
            {amount ? <div className={styles.label}>Size</div> : null}
            {amount ? (
              <div
                className={clsx(styles.amount, {
                  [styles.boost_color]: type === "boost",
                })}
              >
                {amount}
              </div>
            ) : null}
            {executionPrice ? (
              <div className={styles.label}>Execution Price</div>
            ) : null}
            {executionPrice ? (
              <div className={styles.price}>{executionPrice}</div>
            ) : null}
          </div>
        ) : null}
        <div className={styles.progress}>
          <div className={styles.fading_ovelay} />
          <div
            className={styles.progress_bar}
            style={{
              width: progressWidth,
              transition: transitionEnabled
                ? `width ${autoCloseTime}ms linear`
                : "none",
            }}
          />
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.notification.id === nextProps.notification.id;
  },
);
