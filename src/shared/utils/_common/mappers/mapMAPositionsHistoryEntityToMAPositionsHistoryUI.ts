import { mapMarketEntityToMarketUI } from "@/shared/utils/_common";

import {
  defaultNumberCompactFormatter,
  formatTimeAgo,
  priceFormatter,
  xpFormatter,
} from "src/shared/utils/ui-minions";

export const mapMAPositionsHistoryEntityToMAPositionsHistoryUI = (
  entity: any | null,
): any | null => {
  if (!entity || !entity?.market || !entity.market.quoteToken) {
    return null;
  }
  const pnlValue = entity.priceVariationPnl + entity.fundingPnl;
  const totalFees = entity.fees + entity.openingFees;
  const pnlNetValue = pnlValue - totalFees;
  return {
    ...entity,
    action: entity.action,
    baseFormatted: defaultNumberCompactFormatter(entity.base),
    executionPriceFormatted: priceFormatter(entity.executionPrice, {
      precision: entity.market.tickSizeDecimals,
    }),
    feesFormatted: defaultNumberCompactFormatter(entity.fees),
    fundingPnlFormatted: defaultNumberCompactFormatter(entity.fundingPnl, {
      defaultValue: "---",
      showPlusSign: true,
    }),
    id: entity.id,
    market: mapMarketEntityToMarketUI(entity.market)!,
    orderTypeFormatted: entity.orderType === "market" ? "Market" : "Unknown",
    pnlNetValue,
    pnlNetValueFormatted: defaultNumberCompactFormatter(pnlNetValue),
    pnlValue,
    pnlValueFormatted: defaultNumberCompactFormatter(pnlValue),
    priceVariationPnlFormatted: defaultNumberCompactFormatter(
      entity.priceVariationPnl,
      {
        defaultValue: "---",
        showPlusSign: true,
      },
    ),
    realisedPnlFormatted: defaultNumberCompactFormatter(entity.realisedPnl, {
      defaultValue: "---",
      showPlusSign: true,
    }),
    timestampFormatted: formatTimeAgo(entity.timestamp),
    totalFeesFormatted: defaultNumberCompactFormatter(totalFees),
    xpEarnedFormatted: xpFormatter(entity.xpEarned),
  };
};
