"use client";
import React, { FC } from "react";

import useUserSync from "@/shared/hooks/useUserSync";
import { initReyaLib } from "@/shared/utils/reyaConnector";

interface IUserContext {
  children: React.ReactNode | React.ReactNode[];
}

initReyaLib();
const UserContext: FC<IUserContext> = ({ children }) => {
  useUserSync();

  return <div>{children}</div>;
};

export default UserContext;
