"use client";
import React, { useEffect } from "react";

import MobileLeftPanel from "@/containers/trade/components/LeftPanel/MobileLeftPanel";
import TradeWrapper from "@/containers/trade/components/trade_wrapper";
import { usePageContext } from "@/providers/PageContextProvider";
import Block from "@/shared/components/ui/Block";

import Chart from "./components/Chart";
import InfoData from "./components/InfoData";
import LeftPanel from "./components/LeftPanel";
import TradeTable from "./components/TradeTable";
import styles from "./trade-page.module.scss";

const TradePage = () => {
  const { isMobile, isMetaMask, setIsMobile } = usePageContext();

  const isMetamaskBrowser = isMobile && isMetaMask;

  useEffect(() => {
    setIsMobile(isMobile);
  }, []);

  return (
    <>
      <TradeWrapper>
        <div
          className={styles.container}
          style={{
            minHeight: isMetamaskBrowser
              ? window.innerHeight - 250
              : !isMetaMask && isMobile
                ? "calc(100vh - 300px)"
                : "86vh",
          }}
        >
          <Block className={styles.info}>
            <InfoData />
          </Block>

          <div className={styles.main}>
            {!isMobile ? (
              <Block className={styles.left_panel}>
                <LeftPanel />
              </Block>
            ) : null}
            <div className={styles.info_container}>
              <Block className={styles.chart}>
                <Chart />
              </Block>
              <TradeTable />
            </div>
          </div>
          {isMobile ? <MobileLeftPanel /> : null}
        </div>
      </TradeWrapper>
    </>
  );
};

export default TradePage;
