import { Indicator, Root } from "@radix-ui/react-checkbox";
import { Square, SquareCheckBig } from "lucide-react";
import React, { forwardRef, useId } from "react";

import styles from "./Checkbox.module.scss";
import { CheckboxProps } from "./types";

export const Checkbox = forwardRef<
  React.ElementRef<typeof Root>,
  CheckboxProps
>(
  (
    { className, inputClassName, labelClassName, label, details, ...props },
    ref,
  ) => {
    const id = useId();
    return (
      <div className={`${styles["checkbox-container"]} ${className || ""}`}>
        <Root
          ref={ref}
          id={id}
          className={`${styles["checkbox-root"]} ${inputClassName || ""}`}
          {...props}
        >
          {!props.checked && (
            <div className={styles["checkbox-indicator"]}>
              <Square className={styles["checkbox-icon"]} />
            </div>
          )}
          <Indicator className={styles["checkbox-indicator"]}>
            {props.checked && (
              <SquareCheckBig className={styles["checkbox-icon"]} />
            )}
          </Indicator>
        </Root>

        <label
          htmlFor={id}
          className={`${styles["checkbox-label"]} ${labelClassName || ""}`}
        >
          {label}
          {details && <p className={styles["checkbox-details"]}>{details}</p>}
        </label>
      </div>
    );
  },
);
