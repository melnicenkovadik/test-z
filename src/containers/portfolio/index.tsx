"use client";

import React from "react";

import { AccountInfo } from "@/containers/portfolio/AccountInfo/AccountInfo";
import { Chart } from "@/containers/portfolio/Chart/Chart";
import { Controls } from "@/containers/portfolio/Controls/Controls";
import s from "@/containers/portfolio/page.module.scss";
import TableWrapper from "@/containers/portfolio/Tables";

export const PortfolioPageContainer = () => {
  return (
    <div className={s.portfolio_page}>
      <div className={s.header}>
        <AccountInfo />
        <Controls />
      </div>
      <Chart />
      <TableWrapper />
    </div>
  );
};
