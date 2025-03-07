"use client";
import * as React from "react";

import styles from "./Button.module.scss";
import { ButtonProps } from "./types";

export const Button: React.FC<ButtonProps> = ({
  className,
  variant,
  size,
  children,
  disabled,
  ...props
}) => {
  const buttonClass = `${styles.button} 
    ${variant ? styles[`button--${variant}`] : ""} 
    ${size ? styles[`button--${size}`] : ""} 
    ${disabled ? styles.disabled : ""} 
    ${className || ""}`;

  return (
    <button
      type="button"
      className={buttonClass}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
