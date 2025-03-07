// У файлі, де виконується мапінг (наприклад, "mapMAPositionEntityToMAPositionUI.ts"):

import { PositionEntity } from "@reyaxyz/common";

import {
  defaultNumberCompactFormatter,
  priceFormatter,
} from "src/shared/utils/ui-minions";

export const mapMAPositionEntityToMAPositionUI = (
  entity: PositionEntity | null,
): any | null => {
  if (!entity) {
    return null;
  }

  // Наприклад, загальний PnL (якщо треба сумувати кілька полів)
  const totalPnL =
    entity.priceVariationPnl + entity.fundingPnl + entity.realisedPnl;

  return {
    ...entity,
    priceFormatted: priceFormatter(entity.price),
    liquidationPriceFormatted: priceFormatter(entity.liquidationPrice),
    markPriceFormatted: priceFormatter(entity.markPrice),

    sizeFormatted: defaultNumberCompactFormatter(entity.size),
    baseFormatted: defaultNumberCompactFormatter(entity.base),

    realisedPnlFormatted: defaultNumberCompactFormatter(entity.realisedPnl, {
      defaultValue: "---",
      showPlusSign: true,
    }),
    priceVariationPnlFormatted: defaultNumberCompactFormatter(
      entity.priceVariationPnl,
      {
        defaultValue: "---",
        showPlusSign: true,
      },
    ),
    fundingPnlFormatted: defaultNumberCompactFormatter(entity.fundingPnl, {
      defaultValue: "---",
      showPlusSign: true,
    }),
    livePnLFormatted: defaultNumberCompactFormatter(entity.livePnL, {
      defaultValue: "---",
      showPlusSign: true,
    }),

    totalPnL,
    totalPnLFormatted: defaultNumberCompactFormatter(totalPnL, {
      defaultValue: "---",
      showPlusSign: true,
    }),
  };
};
