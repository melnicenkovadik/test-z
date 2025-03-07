import { Candle, CandlesResolution } from "@reyaxyz/api-sdk";

import { ResolutionString } from "@/shared/types/charting-library";

export const RESOLUTION_MAP = {
  "1": CandlesResolution.ONE_MINUTE,
  "15": CandlesResolution.FIFTEEN_MINUTES,
  "1D": CandlesResolution.ONE_DAY,
  "240": CandlesResolution.FOUR_HOURS,
  "30": CandlesResolution.THIRTY_MINUTES,
  "5": CandlesResolution.FIVE_MINUTES,
  "60": CandlesResolution.ONE_HOUR,
} as Record<ResolutionString, Candle["resolution"]>;

export const DEFAULT_RESOLUTION = "60";

const hour = 60 * 60 * 1000;
const day = hour * 24;
const month = day * 30.4;

export const RESOLUTION_CHART_CONFIGS = {
  "1": hour,
  "15": 15 * hour,
  "1D": 2 * month,
  "240": 12 * day,
  "30": 30 * hour,
  "5": 5 * hour,
  "60": 3 * day,
} as Record<ResolutionString, number>;
