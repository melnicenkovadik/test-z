import React from "react";

import styles from "./Loader.module.scss";

interface LoaderProps {
  spinnerColor?: string; // Цвет для border-bottom
  width?: string; // Высота лоадера (например, "48px")
  height?: string; // Ширина лоадера (например, "48px")
  show?: boolean; // Показывать лоадер или нет
}

const Loader: React.FC<LoaderProps> = ({
  spinnerColor = "#f08700",
  width = "48px",
  height = "48px",
  show = false,
}) => {
  const customStyle: React.CSSProperties = {
    "--spinner-color": spinnerColor,
    opacity: show ? 0.6 : 0,
    width,
    height,
  } as React.CSSProperties;

  return <span className={styles.loader} style={customStyle}></span>;
};

export default Loader;
