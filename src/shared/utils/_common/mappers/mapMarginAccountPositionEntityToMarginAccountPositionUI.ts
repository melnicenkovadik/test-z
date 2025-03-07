import { mapMarketEntityToMarketUI } from "@/shared/utils/_common";

import {
  defaultNumberCompactFormatter,
  fundingRateFormatter,
  priceFormatter,
  xpFormatter,
} from "src/shared/utils/ui-minions";

export const mapMarginAccountPositionEntityToMarginAccountPositionUI = (
  entity: any | null,
): any | null => {
  if (!entity || !entity.market) {
    return null;
  }

  return {
    ...entity,
    base: entity.base,
    baseFormatted: defaultNumberCompactFormatter(entity.base),
    conditionalOrdersInfo: {
      stopLoss: entity.conditionalOrdersInfo?.stopLoss
        ? {
            orderId: entity.conditionalOrdersInfo.stopLoss.orderId,
            price: entity.conditionalOrdersInfo.stopLoss.stopLossPrice,
            priceFormatted: priceFormatter(
              entity.conditionalOrdersInfo.stopLoss.stopLossPrice,
              {
                precision: entity.market.tickSizeDecimals,
              },
            ),
          }
        : null,
      takeProfit: entity.conditionalOrdersInfo?.takeProfit
        ? {
            orderId: entity.conditionalOrdersInfo.takeProfit.orderId,
            price: entity.conditionalOrdersInfo.takeProfit.takeProfitPrice,
            priceFormatted: priceFormatter(
              entity.conditionalOrdersInfo.takeProfit.takeProfitPrice,
              {
                precision: entity.market.tickSizeDecimals,
              },
            ),
          }
        : null,
    },
    fundingPnl: entity.fundingPnl,
    fundingPnlFormatted: defaultNumberCompactFormatter(entity.fundingPnl, {
      defaultValue: "---",
      showPlusSign: true,
    }),
    fundingRateFormatted: fundingRateFormatter(entity.fundingRate),
    id: entity.id,
    liquidationPriceFormatted: defaultNumberCompactFormatter(
      entity.liquidationPrice,
    ),
    marginAccountId: entity.account?.id,
    marginAccountName: entity.account?.name,
    markPriceFormatted: defaultNumberCompactFormatter(entity.markPrice),
    market: mapMarketEntityToMarketUI(entity.market)!,
    orderStatus: entity.orderStatus,
    price: entity.price,
    priceFormatted: priceFormatter(entity.price, {
      precision: entity.market.tickSizeDecimals,
    }),
    priceVariationPnl: entity.priceVariationPnl,
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
    side: entity.side,
    size: entity.size,
    sizeFormatted: defaultNumberCompactFormatter(entity.size),
    totalPnlFormatted: defaultNumberCompactFormatter(entity.livePnL, {
      defaultValue: "---",
      showPlusSign: true,
    }),
    tradeXpBoostFormatted: xpFormatter(entity.tradeXpBoost),
    unrealisedPnlFormatted: defaultNumberCompactFormatter(
      entity.unrealisedPnl,
      {
        defaultValue: "---",
        showPlusSign: true,
      },
    ),
  };
};
