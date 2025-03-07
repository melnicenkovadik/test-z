import { SimulateTradeEntity as SimulateTradeEntitySDK } from "@reyaxyz/api-sdk";

import { LARGE_AMOUNT_VALUE } from "@/shared/utils/_common/constants";
import {
  CompactFormatParts,
  defaultNumberCompactFormatter,
  percentageFormatter,
  priceFormatter,
} from "@/shared/utils/ui-minions";

export type SimulateCrossMarginTradeResult = SimulateTradeEntitySDK;

export type SimulateCrossMarginTradeUI = {
  estimatedExecutionPriceFormatted: string;
  estimatedSlippageFormatted: string;
  feesFormatted: CompactFormatParts;
  feesPercentageFormatted: string;
  liquidationPriceFormatted: CompactFormatParts;
  marginBalanceFormatted: CompactFormatParts;
  marginRatio: SimulateCrossMarginTradeResult["marginRatio"];
  marginRatioFormatted: string;
  marginRatioHealth: SimulateCrossMarginTradeResult["marginRatioHealth"];
  maximumSlippageFormatted: string;
  requiredMarginFormatted: CompactFormatParts;
  snappedAmountFormatted: string;
  snappedAmountInBaseFormatted: string;
  xpEarnRangeFormatted: {
    max: CompactFormatParts;
    min: CompactFormatParts;
  };
};

export const mapSimulateCrossMarginTradeResultToSimulateCrossMarginTradeUI = (
  entity: any | null,
): any => {
  if (!entity) {
    return null;
  }

  const absSnappedAmount = Math.abs(entity.snappedAmount);
  const absSnappedAmountCompactFormatted =
    defaultNumberCompactFormatter(absSnappedAmount);
  const absSnappedAmountInBase = Math.abs(entity.snappedAmountInBase);
  const absSnappedAmountInBaseCompactFormatted = defaultNumberCompactFormatter(
    absSnappedAmountInBase,
  );
  return {
    ...entity,
    estimatedAmountBase: entity.estimatedAmountBase,
    estimatedExecutionPriceFormatted: priceFormatter(entity.estimatedPrice),
    estimatedSlippageFormatted: percentageFormatter(entity.estimatedSlippage),
    feesFormatted: defaultNumberCompactFormatter(entity.fees),
    feesPercentageFormatted: percentageFormatter(entity.takerFeesPercentage),
    liquidationPriceFormatted: defaultNumberCompactFormatter(
      entity.liquidationPrice,
    ),
    marginBalanceFormatted: defaultNumberCompactFormatter(entity.marginBalance),
    marginRatio: entity.marginRatio,
    marginRatioFormatted: percentageFormatter(entity.marginRatio),
    marginRatioHealth: entity.marginRatioHealth,
    maximumSlippageFormatted: percentageFormatter(entity.maxSlippage),
    requiredMarginFormatted: defaultNumberCompactFormatter(
      entity.requiredMargin,
    ),
    snappedAmountFormatted:
      absSnappedAmount > LARGE_AMOUNT_VALUE
        ? absSnappedAmountCompactFormatted.value +
          absSnappedAmountCompactFormatted.suffix
        : priceFormatter(absSnappedAmount),
    snappedAmountInBaseFormatted:
      absSnappedAmountInBase > LARGE_AMOUNT_VALUE
        ? absSnappedAmountInBaseCompactFormatted.value +
          absSnappedAmountInBaseCompactFormatted.suffix
        : priceFormatter(absSnappedAmountInBase),
    xpEarnRangeFormatted: {
      max: defaultNumberCompactFormatter(entity.xpEarnRange?.max),
      min: defaultNumberCompactFormatter(entity.xpEarnRange?.min),
    },
  };
};
