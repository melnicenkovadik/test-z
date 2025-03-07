type Source = {
  metaInfo?: {
    shortId?: string;
  };
};

type Pane = {
  sources: Source[];
};

type Chart = {
  panes: Pane[];
};

type ChartConfig = {
  charts?: Chart[];
};

export const cleanSltp = (chartConfig: ChartConfig): ChartConfig => {
  if (!chartConfig?.charts?.[0]?.panes?.[0]?.sources) {
    return chartConfig;
  }

  chartConfig.charts[0].panes[0].sources =
    chartConfig.charts[0].panes[0].sources.filter(
      (source) =>
        !source.metaInfo ||
        (source.metaInfo.shortId !== "sl" && source.metaInfo.shortId !== "tp"),
    );

  return chartConfig;
};
