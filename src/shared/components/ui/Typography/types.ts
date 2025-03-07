import { HTMLAttributes } from "react";

export type TypographyVariantType =
  | "heading1"
  | "heading2"
  | "heading3"
  | "heading4"
  | "heading5"
  | "body1"
  | "body2"
  | "body3"
  | "body4";

export type TypographyColorsType =
  | "base-300"
  | "base-600"
  | "green"
  | "red"
  | "accent"
  | "white";

export type TypographyComponentType =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "span"
  | "div"
  | "legend";

// Defines the props interface for the Typography component, extending the standard HTML heading element attributes.
// - `size`: Optional prop specifying the size of the typography (e.g., heading1, body1, etc.)
// - `color`: Optional prop specifying the color scheme of the typography (e.g., default, accent, etc.)
// - `tag`: Optional prop specifying the underlying HTML element to render (e.g., h1, p, div, etc.)
// - `disableHashtagsHighlighting`: Optional prop to disable highlighting of hashtags in the text.
export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  size?: TypographyVariantType;
  underline?: boolean;
  color?: TypographyColorsType;
  tag?: TypographyComponentType;
  disableHashtagsHighlighting?: boolean;
}
