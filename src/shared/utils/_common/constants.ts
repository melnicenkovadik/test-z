export const SMALL_GAS_FEE_LIMIT = 0.0001;
export const LARGE_AMOUNT_VALUE = 999_999_999;
export const RANGE_ID_TO_TIMEFRAME_MS: Record<string, number> = {
  "1d": 24 * 60 * 60 * 1000,
  "1h": 60 * 60 * 1000,
  "1m": 24 * 31 * 60 * 60 * 1000,
  "1w": 24 * 7 * 60 * 60 * 1000,
  "1y": 24 * 365 * 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
};
export const DEFAULT_FORMATTING_LOCALE = "en-US";
export const INPUT_DECIMAL_LIMITS = 6;
export const DISPLAY_DECIMAL_LIMITS = 2;
export const INPUT_NOTIONAL_SIZE_DECIMAL_LIMITS = 6;
