import { CandlesResolution } from "@reyaxyz/api-sdk";

export type ChannelID = string;
type ParsedChannelId = {
  resolution: CandlesResolution;
  ticker: string;
};

type ParseSubscribeId = {
  ticker: string;
};

const SEPARATOR = "/";
const SUBSCRIPTION_SEPARATOR = "_";

export const parseChannelId = (channelId: ChannelID): ParsedChannelId => {
  const [ticker, resolution] = channelId.split(SEPARATOR);
  return {
    resolution: resolution as CandlesResolution,
    ticker,
  };
};

export const parseSubscribeUID = (subscribeUID: string): ParseSubscribeId => {
  const [ticker] = subscribeUID.split(SUBSCRIPTION_SEPARATOR);
  return {
    ticker,
  };
};

export const generateChannelId = ({ resolution, ticker }: ParsedChannelId) =>
  `${ticker}${SEPARATOR}${resolution}`;
