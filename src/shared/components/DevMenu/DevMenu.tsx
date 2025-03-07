"use client";

import { CogIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useState } from "react";

import { useSettingsStore } from "@/shared/store/settings.store";

import styles from "./DevMenu.module.scss";

const DevMenu = () => {
  const { features, toggleFeature } = useSettingsStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`${styles["dev-menu"]} ${
        isOpen ? styles["dev-menu-open"] : styles["dev-menu-closed"]
      }`}
    >
      {!isOpen ? (
        <button
          className={styles["toggle-button"]}
          onClick={() => setIsOpen(true)}
        >
          <CogIcon className={styles["cog-icon"]} />
        </button>
      ) : (
        <>
          <div className={styles["menu-header"]}>
            <h3 className={styles["menu-title"]}>Developer Menu</h3>
            <button
              className={styles["close-button"]}
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className={styles["setting"]}>
            <Link
              rel="noopener noreferrer nofollow"
              href="/ui-components-preview"
              target="_blank"
            >
              Go to UI Components preview
            </Link>
          </div>
          <div className={styles["settings-section"]}>
            <h4 className={styles["section-title"]}>Experimental Features</h4>
            {features.map((feature) => (
              <div key={feature.name} className={styles["setting"]}>
                <label>
                  <input
                    type="checkbox"
                    checked={feature.enabled}
                    onChange={() => toggleFeature(feature.name)}
                  />
                  {feature.description}
                </label>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DevMenu;
