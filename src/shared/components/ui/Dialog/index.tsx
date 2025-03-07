import {
  Close,
  Content,
  Description,
  Overlay,
  Portal,
  Root,
  Trigger,
} from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import clsx from "clsx";
import Image from "next/image";
import {
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  HTMLAttributes,
} from "react";

import styles from "./dialog.module.scss";

export const Dialog = Root;
export const DialogTrigger = Trigger;
export const DialogPortal = Portal;
export const DialogClose = Close;

export const DialogOverlay = forwardRef<
  ElementRef<typeof Overlay>,
  ComponentPropsWithoutRef<typeof Overlay>
>(({ className, ...props }, ref) => (
  <Overlay
    ref={ref}
    className={clsx(styles["dialog-overlay"], className)}
    {...props}
  />
));

export const DialogContent = forwardRef<
  ElementRef<typeof Content>,
  ComponentPropsWithoutRef<typeof Content> & { container?: HTMLElement | null }
>(({ className, children, container, title, ...props }, ref) => (
  <DialogPortal {...(container && { container })}>
    {/*<DialogOverlay />*/}
    <Content
      ref={ref}
      className={clsx(styles["dialog-content"], className)}
      {...props}
    >
      {title ? (
        <DialogTitle>{title}</DialogTitle>
      ) : (
        <VisuallyHidden>
          <DialogTitle>Title</DialogTitle>
        </VisuallyHidden>
      )}
      {children}
      <DialogClose className={styles["dialog-close"]} asChild>
        <Image
          src="/assets/icons/close_modal.svg"
          alt="Close"
          width={32}
          height={32}
        />
      </DialogClose>
    </Content>
  </DialogPortal>
));

export const DialogTitle = forwardRef<
  ElementRef<typeof Content>,
  ComponentPropsWithoutRef<typeof Content>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={clsx(styles["dialog-title"], className)}
    {...props}
  />
));

export const DialogDescription = forwardRef<
  ElementRef<typeof Description>,
  ComponentPropsWithoutRef<typeof Description>
>(({ className, ...props }, ref) => (
  <Description
    ref={ref}
    className={clsx(styles["dialog-description"], className)}
    {...props}
  />
));

export const DialogHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx(styles["dialog-header"], className)} {...props} />
);

export const DialogFooter = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx(styles["dialog-footer"], className)} {...props} />
);
