import { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "link"
    | "destructive"
    | "white"
    | "system";
  size?:
    | "default"
    | "sm"
    | "lg"
    | "icon-xxs"
    | "icon-xs"
    | "icon-s"
    | "icon-m"
    | "icon-lg";
}
