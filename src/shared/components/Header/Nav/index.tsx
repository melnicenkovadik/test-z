"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { Desktop, Mobile } from "@/shared/components/Device";

import styles from "./Nav.module.scss";

export const navItems = [
  { label: "trade", href: "/" },
  { label: "portfolio", href: "/portfolio" },
];

export default function Nav({
  className,
  setIsMenuOpen,
}: {
  className?: string;
  setIsMenuOpen: any;
}) {
  const pathname = usePathname();
  const t = useTranslations("HEADER");

  return (
    <nav className={className}>
      <Desktop>
        <ul className={clsx(styles.nav_list)}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href} className={styles.nav_item}>
                <Link
                  prefetch
                  onClick={() => {
                    setIsMenuOpen?.(false);
                  }}
                  target={item.href.startsWith("http") ? "_blank" : ""}
                  href={item.href}
                  className={`${styles.nav_link} ${isActive ? styles.nav_link_active : ""}`}
                >
                  <span>{t(item.label)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Desktop>
      <Mobile>
        <ul className={clsx(styles.nav_list_mobile)}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href} className={styles.nav_item_mobile}>
                <Link
                  prefetch
                  onClick={() => {
                    setIsMenuOpen?.(false);
                  }}
                  target={item.href.startsWith("http") ? "_blank" : ""}
                  href={item.href}
                  className={`${styles.nav_link} ${isActive ? styles.nav_link_active_mobile : ""}`}
                >
                  <span>{t(item.label)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Mobile>
    </nav>
  );
}
