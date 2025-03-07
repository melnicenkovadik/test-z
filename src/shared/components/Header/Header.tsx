"use client";
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import s from "@/shared/components/AccountSelect/account_select.module.scss";
import { Mobile } from "@/shared/components/Device";
import ConnectedButton from "@/shared/components/Header/ConnectedButton";
import Health from "@/shared/components/Header/MarginRatio";
import LocaleSwitcher from "@/shared/components/LocaleSwitcher";
import MobileMenuDraver from "@/shared/components/MobileMenuDraver";
import ThemeSelector from "@/shared/components/ThemeSelector/ThemeSelector";
import { Button } from "@/shared/components/ui/Button/button";
import useUserStore from "@/shared/store/user.store";

import styles from "./Header.module.scss";
import Nav from "./Nav";

const Header = () => {
  const { user } = useUserStore();
  const isLoggedIn = useIsLoggedIn();
  const { setShowAuthFlow } = useDynamicContext();
  const t = useTranslations("HEADER");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isMenuOpen]);

  return (
    <header className={styles.header}>
      {/* Logo */}
      <div className={styles.header_left}>
        <Link prefetch href={"/"}>
          <Image
            width={76.908}
            height={20}
            src="/assets/small_logo.svg"
            alt="Zeuz logo"
            className={styles.header_logo_mobile}
          />
          <Image
            width={116}
            height={30}
            src="/assets/logo.svg"
            alt="Zeuz logo"
            className={styles.header_logo_desktop}
          />
        </Link>
        <Mobile>
          {isLoggedIn && user && user?.totalBalanceFormatted?.value ? (
            <div className={s.balance}>
              <span>Balance</span>
              <p>
                {user.totalBalanceFormatted.value} <span>rUSD</span>
              </p>
            </div>
          ) : null}
          {isLoggedIn && user ? <Health /> : null}
          <div className={s.header_mobile_left}>
            {!isLoggedIn && !user ? (
              <Button
                variant="white"
                onClick={() => {
                  setShowAuthFlow(true);
                }}
                className={styles.header_button_mobile}
              >
                {t("connect_button")}
              </Button>
            ) : null}
            <div
              className={styles.header_hamburger}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Image
                src={
                  isMenuOpen ? "/assets/xmarkicon.svg" : "/assets/sandwich.svg"
                }
                alt="Menu"
                width={32}
                height={32}
              />
            </div>
          </div>
        </Mobile>
      </div>

      {isMenuOpen && <MobileMenuDraver setIsMenuOpen={setIsMenuOpen} />}
      <Nav setIsMenuOpen={setIsMenuOpen} className={styles.header_nav} />
      <div className={styles.header_right}>
        <ThemeSelector />
        {isLoggedIn && user && user?.totalBalanceFormatted?.value ? (
          <div className={s.balance}>
            <span>Balance</span>
            <p>
              {user.totalBalanceFormatted.value} <span>rUSD</span>
            </p>
          </div>
        ) : null}
        {isLoggedIn && user ? <Health /> : null}

        {!isLoggedIn || !user ? (
          <Button
            onClick={() => {
              setShowAuthFlow(true);
            }}
            className={styles.header_button}
          >
            {t("connect_button")}
          </Button>
        ) : (
          <ConnectedButton />
        )}
        <LocaleSwitcher />
      </div>
    </header>
  );
};

export default Header;
