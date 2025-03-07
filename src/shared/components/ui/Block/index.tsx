"use client";

import clsx from "clsx";
import React, { ReactNode, CSSProperties } from "react";
import ReactDOM from "react-dom";

import s from "./Block.module.scss";

interface BlockProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  isLoading?: boolean;
  showLoader?: boolean;
  opacityLvl?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
}

const Block: React.FC<BlockProps> = ({
  children,
  className,
  showLoader = true,
  style,
  isLoading,
  opacityLvl = 1,
}) => {
  const blockRef = React.useRef<any>(null);

  // const modifiedChildren = React.Children.map(children, (child) => {
  //   if (React.isValidElement(child)) {
  //     return React.cloneElement(child, {
  //       // @ts-ignore
  //       className: clsx(child.props.className, {
  //         [s.hidden]: isLoading,
  //         [s[`opacity-${opacityLvl}`]]: isLoading,
  //       }),
  //     });
  //   }
  //   return child;
  // });

  return (
    <div
      ref={blockRef}
      className={clsx(className, s.root, {
        [s.hidden]: isLoading,
        [s[`opacity-${opacityLvl}`]]: isLoading,
      })}
      style={style}
    >
      {children}
      {blockRef?.current &&
        isLoading &&
        showLoader &&
        ReactDOM.createPortal(
          <div className={s.loading}>
            <div className={s.spinner}></div>
          </div>,
          blockRef.current as HTMLDivElement,
        )}
    </div>
  );
};

export default Block;
