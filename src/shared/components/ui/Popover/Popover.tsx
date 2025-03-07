"use client";
import {
  Anchor,
  Close,
  Content,
  Portal,
  Root,
  Trigger,
} from "@radix-ui/react-popover";
import { clsx } from "clsx";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";

import styles from "./Popover.module.scss";

export const Popover = Root;

export const PopoverTrigger = Trigger;

export const PopoverAnchor = Anchor;

export const PopoverClose = Close;

export interface PopoverContentProps
  extends ComponentPropsWithoutRef<typeof Content> {
  container?: HTMLElement | null;
}

export const PopoverContent = forwardRef<
  ElementRef<typeof Content>,
  PopoverContentProps & {
    container?: HTMLElement | null;
  }
>(
  (
    { className, align = "center", sideOffset = 4, container, ...props },
    ref,
  ) => (
    <Portal {...(container && { container })}>
      <Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={clsx(styles["popover_content"], className)}
        {...props}
      />
    </Portal>
  ),
);

PopoverContent.displayName = "PopoverContent";
