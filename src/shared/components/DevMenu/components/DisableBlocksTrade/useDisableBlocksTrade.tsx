"use client";
import React from "react";

import Block from "@/shared/components/ui/Block";
import { useSettingsStore } from "@/shared/store/settings.store";

const useDisableBlocksTrade = () => {
  const { features } = useSettingsStore();
  const isDisableBlocksTradeEnabled = features.find(
    (feature) => feature.name === "disableBlocksTrade",
  )?.enabled;

  const DisableBlocksTrade = () => {
    return isDisableBlocksTradeEnabled ? (
      <Block>useDisableBlocksTrades</Block>
    ) : null;
  };

  return {
    DisableBlocksTrade,
  };
};

export default useDisableBlocksTrade;
