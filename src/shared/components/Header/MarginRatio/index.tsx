"use client";
import clsx from "clsx";
import Image from "next/image";
import { useTranslations } from "next-intl";
import React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/Tooltip";
import { Typography } from "@/shared/components/ui/Typography";
import useUserStore from "@/shared/store/user.store";

import styles from "./MarginRatio.module.scss";

const Health: React.FC<{
  ratioPercentage?: number | undefined | null;
  ratioHealth?: number | undefined | null;
  showInfo?: boolean;
}> = ({ showInfo = true, ratioPercentage = null, ratioHealth = null }) => {
  const { user } = useUserStore();
  const { marginRatioPercentage = 0, marginRatioHealth } = user || {};
  const usedRatioPercentage =
    typeof ratioPercentage !== "undefined" && ratioPercentage !== null
      ? ratioPercentage
      : marginRatioPercentage;
  const usedRatioHealth =
    typeof ratioHealth !== "undefined" && ratioHealth !== null
      ? ratioHealth
      : marginRatioHealth;
  const health = Math.max(0, 100 - (usedRatioPercentage || 0));
  const steps = 6;
  const filledSteps = Math.min(Math.floor((health / 100) * steps), steps);

  const t = useTranslations("HEADER");
  return (
    <TooltipProvider>
      <div className={styles.margin_ratio_container}>
        {showInfo ? (
          <Tooltip>
            <Typography className={styles.text_margin_ratio}>
              {t("margin_ratio_label")}
              <TooltipTrigger className={styles.text_margin_ratio_health}>
                &nbsp;
                <Image
                  className={styles.info_icon}
                  src="/assets/info_icon.svg"
                  alt="info"
                  width={16}
                  height={16}
                />
              </TooltipTrigger>
              <TooltipContent>
                Your account health (0-100%) represents how close you are to
                being liquidated
              </TooltipContent>
            </Typography>
          </Tooltip>
        ) : null}
        <div className={styles.margin_value_container}>
          <Typography className={styles.margin_value}>
            {health.toFixed(0)}%
          </Typography>
          <div
            className={clsx(styles.steps_container)}
            role="progressbar"
            aria-valuenow={health}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            {[...Array(steps)].map((_, index) => (
              <div
                key={index}
                className={clsx(styles.step, {
                  [styles.healthy]: usedRatioHealth === "healthy",
                  [styles.warning]: usedRatioHealth === "warning",
                  [styles.danger]: usedRatioHealth === "danger",
                  [styles.filled_step]: index < filledSteps,
                  [styles.empty_step]: index >= filledSteps,
                })}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Health;
