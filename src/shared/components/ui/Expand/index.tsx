"use client";
import { motion, HTMLMotionProps } from "framer-motion";
import React, { ReactNode } from "react";

import { usePageContext } from "@/providers/PageContextProvider";

import s from "./Expand.module.scss";

interface ExpandProps extends HTMLMotionProps<"div"> {
  isOpen: boolean;
  className?: string;
  children: ReactNode;
  startHeight?: number;
}

interface ExpandHeaderBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: ReactNode;
  tag?: "div" | "table" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const Expand: React.FC<ExpandProps> & {
  Header: React.FC<ExpandHeaderBodyProps>;
  Body: React.FC<ExpandHeaderBodyProps>;
} = ({ isOpen, className, children, startHeight = 50, ...props }) => {
  const { isMobile } = usePageContext();

  return (
    <motion.div
      layout
      className={`${s.expand} ${className || ""}`}
      initial={false}
      animate={{ height: isOpen ? "auto" : startHeight }}
      style={{ overflow: isMobile ? "auto" : "hidden" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

const ExpandHeader: React.FC<ExpandHeaderBodyProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={`${s.expand_header} ${className || ""}`} {...props}>
      {children}
    </div>
  );
};

const ExpandBody: React.FC<ExpandHeaderBodyProps> = ({
  className,
  children,
  tag = "div",
  ...props
}) => {
  const ExpandBodyComponent = tag || "h6";

  return (
    <ExpandBodyComponent
      className={`${s.expand_body} ${className || ""}`}
      {...props}
    >
      {children}
    </ExpandBodyComponent>
  );
};

Expand.Header = ExpandHeader;
Expand.Body = ExpandBody;

export default Expand;
