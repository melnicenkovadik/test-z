"use client";
import { useTheme } from "next-themes";

import ClientOnly from "@/shared/components/ClientOrServerOnly/ClientOnly";
import { Button } from "@/shared/components/ui/Button/button";
import { useSettingsStore } from "@/shared/store/settings.store";

import styles from "./ThemeSelector.module.scss";

const ThemeSelector = () => {
  const { features } = useSettingsStore();
  const isThemeEnabled = features.find(
    (feature) => feature.name === "theme",
  )?.enabled;
  const { theme, setTheme } = useTheme();
  const modes = [
    { icon: <span>🌙</span>, displayValue: "Dark", code: "dark" },
    { icon: <span>🌞</span>, displayValue: "Light", code: "light" },
  ];

  const handleModeChange = (modeCode: string) => {
    setTheme(modeCode);
  };

  return (
    <ClientOnly>
      {isThemeEnabled ? (
        <div className={styles.theme_selector}>
          {modes.map((mode) => (
            <Button
              key={mode.code}
              className={
                theme === mode.code ? styles.selected : styles.not_selected
              }
              onClick={() => handleModeChange(mode.code)}
            >
              {mode.icon}
              {mode.displayValue}
            </Button>
          ))}
        </div>
      ) : null}
    </ClientOnly>
  );
};

export default ThemeSelector;
