import React, { ReactNode } from "react";

import { usePageContext } from "@/providers/PageContextProvider";

interface DeviceProps {
  children: ReactNode;
}

export const Mobile: React.FC<DeviceProps> = ({ children }) => {
  const { isMobile } = usePageContext();
  return isMobile ? <>{children}</> : null;
};

export const Desktop: React.FC<DeviceProps> = ({ children }) => {
  const { isMobile } = usePageContext();
  return !isMobile ? <>{children}</> : null;
};
