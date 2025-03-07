"use client";
import Image from "next/image";
import Marquee from "react-fast-marquee";

import { useMarketStore } from "@/shared/store/useMarketStore";

import styles from "./Footer.module.scss";

const Footer = () => {
  const { markets } = useMarketStore();

  return (
    <footer className={styles.footer}>
      <div className={styles.copyright_section}>
        <span className={styles.copyright_text}>© 2025 Zeuz.</span>
      </div>

      <div className={styles.market_section}>
        <Marquee gradient={false} speed={50}>
          {markets.map((market, index) => (
            <MarketItem
              key={`${market.id}-${index}`}
              symbol={market.quoteToken}
              change={market.priceChange24HPercentage.toFixed(2)}
            />
          ))}
        </Marquee>
      </div>

      <div className={`${styles.links_section} ${styles.orderLinks}`}>
        {/* Docs icon link changed */}
        <a
          href="https://docs.zeuz.trade/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.header_link}
        >
          <Image src="/assets/folder.svg" alt="Docs" width={20} height={20} />
        </a>
        <a
          href="https://discord.gg/hAXaJMwyUe"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.header_link}
        >
          <Image
            src="/assets/discord.svg"
            alt="Discord"
            width={20}
            height={20}
          />
        </a>
        <a
          href="https://x.com/zeuzdottrade"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.header_link}
        >
          <Image
            src="/assets/twitter.svg"
            alt="Twitter"
            width={20}
            height={20}
          />
        </a>
        {/* Telegram icon link changed */}
        <a
          href="https://t.me/zeuzdottrade"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.header_link}
        >
          <Image
            src="/assets/telegram.svg"
            alt="Telegram"
            width={20}
            height={20}
          />
        </a>
      </div>
    </footer>
  );
};

const MarketItem = ({ symbol, change }: { symbol: string; change: string }) => {
  return (
    <div className={styles.market_item}>
      <span className={styles.market_symbol}>{symbol}</span>
      <span className={styles.market_divider}>/rUSD</span>
      <span
        className={
          parseFloat(change) < 0
            ? styles.market_change_red
            : styles.market_change_green
        }
      >
        {change}%
      </span>
    </div>
  );
};

export default Footer;
