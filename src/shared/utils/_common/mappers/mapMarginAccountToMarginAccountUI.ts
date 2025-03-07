import { MarginAccountEntity } from "@reyaxyz/common/dist/types";

import { mapMarginAccountPositionEntityToMarginAccountPositionUI } from "@/shared/utils/_common";

import {
  defaultNumberCompactFormatter,
  notEmpty,
  percentageFormatter,
} from "src/shared/utils/ui-minions";

export const mapMarginAccountToMarginAccountUI = (
  entity: MarginAccountEntity | null,
): any | null => {
  if (!entity) {
    return null;
  }

  const totalBalanceChange24HPercentage =
    entity.totalBalanceChange24HPercentage;
  const balanceChange24HDirection =
    totalBalanceChange24HPercentage >= 0 ? "positive" : "negative";

  const marginRatioPercentage = entity.marginRatioPercentage;
  return {
    // ...entity,
    balanceChange24HDirection,
    balanceChange24HPercentageFormatted: percentageFormatter(
      totalBalanceChange24HPercentage,
    ),
    collaterals: entity.collaterals.map((c) => ({
      balanceFormatted: defaultNumberCompactFormatter(c.balance),
      balanceRUSDFormatted: defaultNumberCompactFormatter(c.balanceRUSD),
      exchangeRateChange24HDirection:
        c.exchangeRateChange24HPercentage >= 0 ? "positive" : "negative",
      exchangeRateChange24HPercentageFormatted: percentageFormatter(
        c.exchangeRateChange24HPercentage,
      ),
      exchangeRateFormatted: defaultNumberCompactFormatter(c.exchangeRate),
      percentageFormatted: percentageFormatter(c.percentage),
      token: c.token,
    })),
    id: entity.id,
    isApproachingLiquidation: entity.isApproachingLiquidation,
    isLiquidationImminent: entity.isLiquidationImminent,
    livePNLFormatted: defaultNumberCompactFormatter(entity.livePnL, {
      defaultValue: "---",
      showPlusSign: true,
    }),
    livePNLUnderlyingAsset: entity.totalBalanceUnderlyingAsset,
    marginRatioHealth: entity.marginRatioHealth,
    marginRatioHealthDangerThreshold: entity.marginRatioHealthDangerThreshold,
    marginRatioPercentage,
    marginRatioPercentageFormatted: percentageFormatter(marginRatioPercentage),
    name: entity.name,
    positions: (entity.positions || [])
      .map(mapMarginAccountPositionEntityToMarginAccountPositionUI)
      .filter(notEmpty),
    realizedPNLFormatted: defaultNumberCompactFormatter(entity.realizedPnL),
    realizedPNLUnderlyingAsset: entity.realizedPnLUnderlyingAsset,
    realizedPnlHistoryTotalFormatted: defaultNumberCompactFormatter(
      entity.realizedPnlHistoryTotal,
    ),
    totalBalanceFormatted: defaultNumberCompactFormatter(entity.totalBalance),
    totalBalanceUnderlyingAsset: entity.totalBalanceUnderlyingAsset,
    totalBalanceWithHaircutFormatted: defaultNumberCompactFormatter(
      entity.totalBalanceWithHaircut,
    ),
    totalPositionsCount: entity.totalPositionsCount,
  };
};
