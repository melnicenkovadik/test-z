import clsx from "clsx";
import React from "react";

import s from "./Separator.module.scss";

const Separator = ({ className }: { className?: string }) => (
  <div className={clsx(s.separator, className)} />
);

export default Separator;
