export interface IEditSLxTPModalProps {
  id: number;
  orderStatus: string;
  liquidationPrice: number;
  markPrice: number;
  marketId: number;
  price: number;
  realisedPnl: number;
  priceVariationPnl: number;
  fundingPnl: number;
  livePnL: number;
  side: string;
  size: number;
  base: number;
  unrealisedPnl: number;
  accountId: number;
  account: Account;
  conditionalOrdersInfo: ConditionalOrdersInfo;
  market: Market;
  baseFormatted: BaseFormatted;
  fundingPnlFormatted: FundingPnlFormatted;
  fundingRateFormatted: string;
  liquidationPriceFormatted: LiquidationPriceFormatted;
  marginAccountId: number;
  marginAccountName: string;
  markPriceFormatted: MarkPriceFormatted;
  priceFormatted: string;
  priceVariationPnlFormatted: PriceVariationPnlFormatted;
  realisedPnlFormatted: RealisedPnlFormatted;
  sizeFormatted: SizeFormatted;
  totalPnlFormatted: TotalPnlFormatted;
  tradeXpBoostFormatted: string;
  unrealisedPnlFormatted: UnrealisedPnlFormatted;
}

export interface Account {
  name: string;
  id: number;
}

export interface ConditionalOrdersInfo {
  stopLoss: StopLoss;
  takeProfit: TakeProfit;
}

export interface StopLoss {
  orderId: string;
  price: number;
  priceFormatted: string;
}

export interface TakeProfit {
  orderId: string;
  price: number;
  priceFormatted: string;
}

export interface Market {
  id: number;
  ticker: string;
  underlyingAsset: string;
  quoteToken: string;
  markPrice: number;
  isActive: boolean;
  maxLeverage: number;
  volume24H: number;
  priceChange24H: number;
  priceChange24HPercentage: number;
  openInterest: number;
  fundingRate: number;
  fundingRateAnnualized: number;
  description: string;
  tickSizeDecimals: number;
  minOrderSizeBase: number;
  minOrderSize: number;
  baseSpacing: number;
  priceSpacing: number;
  orderInfo: OrderInfo;
  longOI: number;
  shortOI: number;
  longSkewPercentage: number;
  shortSkewPercentage: number;
  availableLong: number;
  availableShort: number;
  availableLongFormatted: AvailableLongFormatted;
  availableShortFormatted: AvailableShortFormatted;
  fundingRateAnnualizedFormatted: string;
  fundingRateChange: string;
  fundingRateFormatted: string;
  longOIFormatted: LongOiformatted;
  longSkewPercentageFormatted: string;
  markPriceFormatted: string;
  minOrderSizeBaseFormatted: string;
  minOrderSizeFormatted: string;
  openInterestFormatted: OpenInterestFormatted;
  priceChange24HDirection: string;
  priceChange24HFormatted: string;
  shortOIFormatted: ShortOiformatted;
  shortSkewPercentageFormatted: string;
  volume24HFormatted: Volume24Hformatted;
}

export interface OrderInfo {
  exchangeId: number;
  counterpartyAccountIds: number[];
}

export interface AvailableLongFormatted {
  suffix: string;
  value: string;
}

export interface AvailableShortFormatted {
  suffix: string;
  value: string;
}

export interface LongOiformatted {
  suffix: string;
  value: string;
}

export interface OpenInterestFormatted {
  suffix: string;
  value: string;
}

export interface ShortOiformatted {
  suffix: string;
  value: string;
}

export interface Volume24Hformatted {
  suffix: string;
  value: string;
}

export interface BaseFormatted {
  suffix: string;
  value: string;
}

export interface FundingPnlFormatted {
  suffix: string;
  value: string;
}

export interface LiquidationPriceFormatted {
  suffix: string;
  value: string;
}

export interface MarkPriceFormatted {
  suffix: string;
  value: string;
}

export interface PriceVariationPnlFormatted {
  suffix: string;
  value: string;
}

export interface RealisedPnlFormatted {
  suffix: string;
  value: string;
}

export interface SizeFormatted {
  suffix: string;
  value: string;
}

export interface TotalPnlFormatted {
  suffix: string;
  value: string;
}

export interface UnrealisedPnlFormatted {
  suffix: string;
  value: string;
}
