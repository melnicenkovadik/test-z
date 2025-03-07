import { MarketUI } from "@/services/markets/types";
import {
  AsyncRequestStatus,
  ChangeDirection,
  GetMarginAccountsResult,
} from "@/shared/utils/_common";
import { CompactFormatParts } from "@/shared/utils/ui-minions";

import {
  ConditionalOrderStatus,
  GetConditionalOrdersHistoryForMarginAccountResult,
  UnifiedConditionalOrderType,
} from "./services";
import { CheckIsTradePermissionGrantedToEmbeddedWalletResult } from "./services/checkIsConditionalOrdersPermissionGrantedToEmbeddedWalletService";

export type GetAllMarginAccountsSummaryResult = {
  totalAccountsCount: number;
  totalBalance: number;
  totalBalanceChangePercentage: number;
  totalBalanceUnderlyingAsset: string;
};

export type MarginAccountEntity = GetMarginAccountsResult[number];
export type MarginAccountsSummaryEntity = GetAllMarginAccountsSummaryResult;

export type MarginAccountCollateralUI = {
  balanceFormatted: CompactFormatParts;
  balanceRUSDFormatted: CompactFormatParts;
  exchangeRateChange24HDirection: ChangeDirection;
  exchangeRateChange24HPercentageFormatted: string;
  exchangeRateFormatted: CompactFormatParts;
  percentageFormatted: string;
  token: MarginAccountEntity["collaterals"][0]["token"];
};

export type MarginAccountsSummaryUI = {
  totalAccountsCount: number;
  totalBalanceChangeDirection: ChangeDirection;
  totalBalanceChangePercentageFormatted: string;
  totalBalanceFormatted: CompactFormatParts;
  totalBalanceUnderlyingAsset: MarginAccountsSummaryEntity["totalBalanceUnderlyingAsset"];
};

export type MarginAccountUI = {
  balanceChange24HDirection: ChangeDirection;
  balanceChange24HPercentageFormatted: string;
  collaterals: MarginAccountCollateralUI[];
  id: MarginAccountEntity["id"];
  isApproachingLiquidation: MarginAccountEntity["isApproachingLiquidation"];
  isLiquidationImminent: MarginAccountEntity["isLiquidationImminent"];
  livePNLFormatted: CompactFormatParts;
  livePNLUnderlyingAsset: MarginAccountEntity["livePnLUnderlyingAsset"];
  marginRatioHealth: MarginAccountEntity["marginRatioHealth"];
  marginRatioHealthDangerThreshold: MarginAccountEntity["marginRatioHealthDangerThreshold"];
  marginRatioPercentage: MarginAccountEntity["marginRatioPercentage"];
  marginRatioPercentageFormatted: string;
  name: MarginAccountEntity["name"];
  positions: MarginAccountPositionUI[];
  realizedPNLFormatted: CompactFormatParts;
  realizedPNLUnderlyingAsset: MarginAccountEntity["realizedPnLUnderlyingAsset"];
  realizedPnlHistoryTotalFormatted: CompactFormatParts;
  totalBalanceFormatted: CompactFormatParts;
  totalBalanceUnderlyingAsset: MarginAccountEntity["totalBalanceUnderlyingAsset"];
  totalBalanceWithHaircutFormatted: CompactFormatParts;
  totalPositionsCount: MarginAccountEntity["totalPositionsCount"];
};

export type MarginAccountPositionEntity =
  MarginAccountEntity["positions"][number];

export type ConditionalOrdersInfoUI = {
  stopLoss: {
    orderId: string;
    price: number;
    priceFormatted: string;
  } | null;
  takeProfit: {
    orderId: string;
    price: number;
    priceFormatted: string;
  } | null;
};

export type MarginAccountPositionUI = {
  base: MarginAccountPositionEntity["base"];
  baseFormatted: CompactFormatParts;
  conditionalOrdersInfo: ConditionalOrdersInfoUI;
  fundingPnl: number;
  fundingPnlFormatted: CompactFormatParts;
  fundingRateFormatted: string;
  id: MarginAccountPositionEntity["id"];
  liquidationPriceFormatted: CompactFormatParts;
  marginAccountId: MarginAccountPositionEntity["account"]["id"];
  marginAccountName: MarginAccountPositionEntity["account"]["name"];
  markPriceFormatted: CompactFormatParts;
  market: MarketUI;
  orderStatus: MarginAccountPositionEntity["orderStatus"];
  price: MarginAccountPositionEntity["price"];
  priceFormatted: string;
  priceVariationPnl: MarginAccountPositionEntity["priceVariationPnl"];
  priceVariationPnlFormatted: CompactFormatParts;
  realisedPnlFormatted: CompactFormatParts;
  side: MarginAccountPositionEntity["side"];
  size: MarginAccountPositionEntity["size"];
  sizeFormatted: CompactFormatParts;
  totalPnlFormatted: CompactFormatParts;
  tradeXpBoostFormatted: string;
  unrealisedPnlFormatted: CompactFormatParts;
};

export type AsyncBooleanState = {
  error: string | null;
  status: AsyncRequestStatus;
  value: boolean;
};

export type SliceState = {
  conditionalOrders: {
    error: string | null;
    isInitiallyFetching: boolean;
    status: AsyncRequestStatus;
    value: GetConditionalOrdersHistoryForMarginAccountResult;
  };
  conditionalOrdersHistoryPerWallet: {
    error: string | null;
    status: AsyncRequestStatus;
    value: GetConditionalOrdersHistoryForMarginAccountResult;
  };
  hasTradePermissionAlreadyBeenGivenForMAs: {
    [marginAccountId: number]: AsyncBooleanState;
  };
  isTradePermissionGrantedInCurrentSessionForEmbeddedWallet: {
    [marginAccountId: number]: AsyncBooleanState;
  };
  isTradePermissionGrantedNowForMAs: {
    [marginAccountId: number]: AsyncBooleanState;
  };
  isTradePermissionGrantedToEmbeddedWallet: {
    error: string | null;
    status: AsyncRequestStatus;
    value:
      | CheckIsTradePermissionGrantedToEmbeddedWalletResult["permissionGiven"]
      | null;
  };
  isTradePermissionRevokedForEmbeddedWallet: {
    error: string | null;
    status: AsyncRequestStatus;
    value: boolean;
  };
  positionWithOpenLimitOrderModal: UnifiedConditionalOrderTypeUI | null;
  positionWithOpenSLModal: MarginAccountPositionUI | null;
  stopLoss: {
    isStopLossCancelled: AsyncBooleanState;
    isStopLossRegistered: AsyncBooleanState;
    isStopLossUpdated: AsyncBooleanState;
  };
  takeProfit: {
    isTakeProfitCancelled: AsyncBooleanState;
    isTakeProfitRegistered: AsyncBooleanState;
    isTakeProfitUpdated: AsyncBooleanState;
  };
};

export type UnifiedConditionalOrderTypeUI = {
  accountId: UnifiedConditionalOrderType["accountId"];
  base: UnifiedConditionalOrderType["base"];
  baseFormatted: CompactFormatParts | string;
  isLong: UnifiedConditionalOrderType["isLong"];
  marketId: UnifiedConditionalOrderType["marketId"];
  orderId: UnifiedConditionalOrderType["orderId"];
  orderType: UnifiedConditionalOrderType["orderType"];
  orderTypeFormatted: UnifiedConditionalOrderType["orderType"] | "Other";
  price: UnifiedConditionalOrderType["price"];
  priceFormatted: CompactFormatParts;
  status: ConditionalOrderStatus;
  statusFormatted: string;
  timestampFormatted: string;
};
