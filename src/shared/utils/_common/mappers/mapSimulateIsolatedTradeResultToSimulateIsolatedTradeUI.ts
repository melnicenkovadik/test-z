import { SimulateIsolatedTradeResult } from "@/services/trade-form/simulateIsolatedTradeService";
import { LARGE_AMOUNT_VALUE } from "@/shared/utils/_common/constants";
import {
  defaultNumberCompactFormatter,
  percentageFormatter,
  priceFormatter,
} from "@/shared/utils/ui-minions";

export const mapSimulateIsolatedTradeResultToSimulateIsolatedTradeUI = (
  entity: SimulateIsolatedTradeResult | null,
): any | null => {
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
    estimatedExecutionPriceFormatted: priceFormatter(entity.estimatedPrice),
    estimatedSlippageFormatted: percentageFormatter(entity.estimatedSlippage),
    feesFormatted: defaultNumberCompactFormatter(entity.fees),
    feesPercentageFormatted: percentageFormatter(entity.takerFeesPercentage),
    liquidationPriceFormatted: defaultNumberCompactFormatter(
      entity.liquidationPrice,
    ),
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
