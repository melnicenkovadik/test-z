"use client";
import {
  Content,
  Portal,
  Provider,
  Root,
  Trigger,
} from "@radix-ui/react-tooltip";
import { clsx } from "clsx";
import { forwardRef } from "react";

import styles from "./Tooltip.module.css";
import { TooltipProviderProps } from "./types";

export const TooltipProvider: React.FC<TooltipProviderProps> = Provider;

export const Tooltip = Root;

export const TooltipTrigger = forwardRef<
  React.ElementRef<typeof Trigger>,
  React.ComponentPropsWithoutRef<typeof Trigger>
>(({ children, ...props }, ref) => (
  <Trigger className={styles.tooltip_trigger} ref={ref} {...props}>
    {children}
  </Trigger>
));

export const TooltipPortal = Portal;

export const TooltipContent = forwardRef<
  React.ElementRef<typeof Content>,
  React.ComponentPropsWithoutRef<typeof Content>
>(({ className, sideOffset = 4, children, ...props }, ref) => (
  <Content
    ref={ref}
    sideOffset={sideOffset}
    className={clsx(styles.tooltip, className)}
    {...props}
  >
    {children}
  </Content>
));
