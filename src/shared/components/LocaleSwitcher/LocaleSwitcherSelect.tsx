"use client";

import { CheckIcon, LanguageIcon } from "@heroicons/react/24/solid";
import * as Select from "@radix-ui/react-select";
import { useTransition } from "react";

import { Locale } from "@/providers/i18n/config";
import { setUserLocale } from "@/providers/i18n/locale";

import styles from "./LocaleSwitcherSelect.module.scss";

type Props = {
  defaultValue: string;
  items: Array<{ value: string; label: string }>;
  label: string;
};

export default function LocaleSwitcherSelect({
  defaultValue,
  items,
  label,
}: Props) {
  const [isPending, startTransition] = useTransition();

  function onChange(value: string) {
    const locale = value as Locale;
    startTransition(() => {
      setUserLocale(locale);
    });
  }

  return (
    <div className={styles["locale-switcher"]}>
      <Select.Root defaultValue={defaultValue} onValueChange={onChange}>
        <Select.Trigger
          aria-label={label}
          className={`${styles["select-trigger"]} ${isPending ? styles.pending : ""}`}
        >
          <Select.Icon>
            <LanguageIcon className={styles["select-icon"]} />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            align="end"
            className={styles["select-content"]}
            position="popper"
          >
            <Select.Viewport>
              {items.map((item) => (
                <Select.Item
                  key={item.value}
                  className={`${styles["select-item"]} ${item.value === defaultValue ? styles["highlighted"] : ""}`}
                  value={item.value}
                >
                  <div className={styles["check-icon"]}>
                    {item.value === defaultValue && (
                      <CheckIcon className="h-5 w-5 text-slate-600" />
                    )}
                  </div>
                  <span className={styles["item-label"]}>{item.label}</span>
                </Select.Item>
              ))}
            </Select.Viewport>
            <Select.Arrow className={styles["select-arrow"]} />
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
