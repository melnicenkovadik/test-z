import { useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import AccountSelect from "@/shared/components/AccountSelect";
import ConnectedButton from "@/shared/components/Header/ConnectedButton";
import { navItems } from "@/shared/components/Header/Nav";
import useUserStore from "@/shared/store/user.store";

import s from "./MobileMenuDraver.module.scss";

const MobileMenuDraver = ({ setIsMenuOpen }: any) => {
  const pathname = usePathname();
  const { user, accounts } = useUserStore();
  const isLoggedIn = useIsLoggedIn();

  return (
    <div className={s.mobile_menu}>
      <div className={s.mobile_menu_content}>
        <div className={s.navigation}>
          {navItems?.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                onClick={() => {
                  setIsMenuOpen?.(false);
                }}
                className={`${s.nav_link} ${isActive ? s.nav_link_active : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        {isLoggedIn && user && accounts ? (
          <AccountSelect
            classname={s.acc_classname}
            selectClassName={s.acc_select_class_name}
            selectContentClassName={s.acc_select_content_class_name}
            selectLabelClassName={s.acc_select_label_class_name}
          />
        ) : null}
        {isLoggedIn || user ? (
          <ConnectedButton className={s.header_button_connected} />
        ) : null}
      </div>
      <div className={s.mobile_menu_footer}>
        <div className={s.footer_text}>© 2025 Zeuz.</div>
        <div className={`${s.links_section}`}>
          {/* Docs icon link changed */}
          <a
            href="https://docs.zeuz.trade/"
            target="_blank"
            rel="noopener noreferrer"
            className={s.footer_link}
          >
            <Image src="/assets/folder.svg" alt="Docs" width={20} height={20} />
          </a>
          <a
            href="https://discord.gg/hAXaJMwyUe"
            target="_blank"
            rel="noopener noreferrer"
            className={s.footer_link}
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
            className={s.footer_link}
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
            className={s.footer_link}
          >
            <Image
              src="/assets/telegram.svg"
              alt="Telegram"
              width={20}
              height={20}
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default MobileMenuDraver;
