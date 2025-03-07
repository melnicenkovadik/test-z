import { MarketEntity } from "@reyaxyz/api-sdk";

import {
  defaultNumberCompactFormatter,
  fundingRateFormatter,
  percentageFormatter,
  priceFormatter,
} from "src/shared/utils/ui-minions";

export const mapMarketEntityToMarketUI = (
  entity: MarketEntity | null,
): any | null => {
  if (!entity) {
    return null;
  }

  return {
    ...entity,
    availableLongFormatted: defaultNumberCompactFormatter(entity.availableLong),
    availableShortFormatted: defaultNumberCompactFormatter(
      entity.availableShort,
    ),
    description: entity.description,
    fundingRate: entity.fundingRate,
    fundingRateAnnualizedFormatted: fundingRateFormatter(
      entity.fundingRateAnnualized,
    ),
    fundingRateChange: entity.fundingRate >= 0 ? "positive" : "negative",
    fundingRateFormatted: fundingRateFormatter(entity.fundingRate),
    id: entity.id,
    isActive: entity.isActive,
    longOIFormatted: defaultNumberCompactFormatter(entity.longOI),
    longSkewPercentage: entity.longSkewPercentage,
    longSkewPercentageFormatted: percentageFormatter(entity.longSkewPercentage),
    markPrice: entity.markPrice,
    markPriceFormatted: priceFormatter(entity.markPrice, {
      padTrailingZeros: true,
      precision: entity.tickSizeDecimals,
    }),
    maxLeverage: entity.maxLeverage,
    minOrderSize: entity.minOrderSize,
    minOrderSizeBase: entity.minOrderSizeBase,
    minOrderSizeBaseFormatted: priceFormatter(entity.minOrderSizeBase),
    minOrderSizeFormatted: priceFormatter(entity.minOrderSize),
    openInterestFormatted: defaultNumberCompactFormatter(entity.openInterest),
    orderInfo: entity.orderInfo,
    priceChange24HDirection:
      entity.priceChange24HPercentage >= 0 ? "positive" : "negative",
    priceChange24HFormatted: percentageFormatter(
      entity.priceChange24HPercentage,
    ),

    priceChange24HPercentage: entity.priceChange24HPercentage,
    quoteToken: entity.quoteToken,
    shortOIFormatted: defaultNumberCompactFormatter(entity.shortOI),
    shortSkewPercentageFormatted: percentageFormatter(
      entity.shortSkewPercentage,
    ),
    tickSizeDecimals: entity.tickSizeDecimals,
    ticker: entity.ticker,
    underlyingAsset: entity.underlyingAsset,
    volume24H: entity.volume24H,
    volume24HFormatted: defaultNumberCompactFormatter(entity.volume24H),
  };
};
