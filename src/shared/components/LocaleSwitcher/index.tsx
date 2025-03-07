"use client";
import { useLocale, useTranslations } from "next-intl";

import { useSettingsStore } from "@/shared/store/settings.store";

import LocaleSwitcherSelect from "./LocaleSwitcherSelect";

export default function LocaleSwitcher() {
  const { features } = useSettingsStore();
  const isLangEnabled = features.find(
    (feature) => feature.name === "language",
  )?.enabled;
  const t = useTranslations("HEADER");
  const locale = useLocale();

  return isLangEnabled ? (
    <LocaleSwitcherSelect
      defaultValue={locale}
      items={[
        {
          value: "en",
          label: t("en"),
        },
        {
          value: "ru",
          label: t("ru"),
        },
      ]}
      label={t("locale_switch_label")}
    />
  ) : null;
}
