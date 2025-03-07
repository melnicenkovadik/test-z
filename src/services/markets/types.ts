import { MarketEntity as MarketEntitySDK } from "@reyaxyz/api-sdk";

import { AsyncRequestStatus, ChangeDirection } from "@/shared/utils/_common";
import { CompactFormatParts } from "@/shared/utils/ui-minions";

export type SliceState = {
  currentMarketId: MarketEntity["id"] | null;
  markets: {
    status: AsyncRequestStatus;
    value: MarketEntity[];
  };
  staticMarkets: {
    error: string | null;
    status: AsyncRequestStatus;
    value: MarketEntity[];
  };
};

export type MarketEntity = MarketEntitySDK;

export type MarketUI = {
  availableLong?: number;
  availableShort?: number;
  shortOI?: number;
  longOI?: number;
  liquidity?: number;
  marketOpenInterest: number;
  icon?: string;
  priceChange24H?: number;
  baseSpacing: MarketEntity["baseSpacing"];
  availableLongFormatted: CompactFormatParts;
  availableShortFormatted: CompactFormatParts;
  description: MarketEntity["description"];
  fundingRate: number;
  fundingRateAnnualizedFormatted: string;
  fundingRateChange: ChangeDirection;
  fundingRateFormatted: string;
  id: MarketEntity["id"];
  isActive: boolean;
  longOIFormatted: CompactFormatParts;
  longSkewPercentage: number;
  shortSkewPercentage?: number;
  longSkewPercentageFormatted: string;
  markPrice: MarketEntity["markPrice"];
  markPriceFormatted: string;
  maxLeverage: number;
  minOrderSize: MarketEntity["minOrderSize"];
  minOrderSizeBase: MarketEntity["minOrderSizeBase"];
  minOrderSizeBaseFormatted: string;
  minOrderSizeFormatted: string;
  openInterestFormatted: CompactFormatParts;
  orderInfo: MarketEntity["orderInfo"];
  priceChange24HDirection: ChangeDirection;
  priceChange24HFormatted: string;
  priceChange24HPercentage: number;
  quoteToken: MarketEntity["quoteToken"];
  shortOIFormatted: CompactFormatParts;
  shortSkewPercentageFormatted: string;
  tickSizeDecimals: MarketEntity["tickSizeDecimals"];
  ticker: string;
  underlyingAsset: MarketEntity["underlyingAsset"];
  volume24H: number;
  volume24HFormatted: CompactFormatParts;
};
