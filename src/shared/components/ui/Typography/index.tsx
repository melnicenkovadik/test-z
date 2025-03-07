import React from "react";

import { highlightHashtags } from "@/shared/utils/highlightHashtags";

import { TypographyProps } from "./types";
import styles from "./Typography.module.scss";

export function Typography({
  size = "body1",
  color = "accent",
  tag = "h6",
  underline = false,
  disableHashtagsHighlighting = false,
  className,
  children,
  ...rest
}: TypographyProps) {
  const sizeClass = styles[`typography--${size}`];
  const colorClass = styles[`typography--${color}`];
  const underlineClass = underline ? styles["typography--underline"] : "";
  const TitleComponent = tag || "h6";

  const processedChildren =
    typeof children === "string" && !disableHashtagsHighlighting
      ? highlightHashtags(children)
      : children;

  return (
    <TitleComponent
      className={`${styles.typography} ${sizeClass} ${colorClass} ${className} ${underlineClass} `}
      {...rest}
    >
      {processedChildren}
    </TitleComponent>
  );
}
