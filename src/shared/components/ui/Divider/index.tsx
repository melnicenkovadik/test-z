import clsx from "clsx";
import React, { FC } from "react";

import styles from "./Divider.module.scss";

interface IDivider extends React.HTMLAttributes<HTMLDivElement> {
  margin?: string;
  direction?: "horizontal" | "vertical";
  className?: string;
}

const Divider: FC<IDivider> = ({
  margin = "16px",
  direction = "horizontal",
  className,
}) => {
  return (
    <div
      className={clsx(styles.divider, styles[direction], className)}
      style={{
        margin: direction === "horizontal" ? `${margin} 0` : `0 ${margin}`,
      }}
    />
  );
};

export default Divider;
