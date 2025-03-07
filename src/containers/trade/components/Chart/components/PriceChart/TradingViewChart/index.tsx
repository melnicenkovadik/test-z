//@ts-nocheck
import { useCallback, useEffect, useRef, useState } from "react";

import {
  getReyaDatafeed,
  savedTvChartResolution,
  setTvChartResolution,
} from "@/containers/trade/components/Chart/components/PriceChart/TradingViewChart/api";
import { usePerpetualsStore } from "@/containers/trade/components/Chart/components/PriceChart/TradingViewChart/usePerpetualsStore";
import { useReyaChartsClient } from "@/containers/trade/components/Chart/useReyaChartsClient";
import { usePersist } from "@/shared/hooks/usePersist";
import { useMarketStore } from "@/shared/store/useMarketStore";
import useUserStore from "@/shared/store/user.store";
import { cleanSltp } from "@/shared/utils/chart";
import { RESOLUTION_CHART_CONFIGS } from "@/shared/utils/maps";
import { notEmpty } from "@/shared/utils/notEmpty";
import { persistValue } from "@/shared/utils/persistValue";
import { isEmpty, priceFormatter } from "@/shared/utils/ui-minions";

import {
  ChartingLibraryWidgetOptions,
  CustomIndicator,
  EntityId,
  IChartWidgetApi,
  IPineStudyResult,
  ISubscription,
  LanguageCode,
  LibraryPineStudy,
  RawStudyMetaInfoId,
  ResolutionString,
  StudyInputId,
  StudyMetaInfo,
  TimeFrameType,
  TimeFrameValue,
  widget,
} from "../../../../../../../../public/static/charting_library";

export interface ExtendedCustomIndicator extends CustomIndicator {
  _context?: Context;
  _input?: () => void;
  readonly constructor: () => void;
  init?: (context: Context, inputCallback: () => void) => void;
  main?: (context: Context, inputCallback: () => void) => void;
  readonly metainfo: StudyMetaInfo;
  readonly name: string;
}

export interface Context {
  new_sym: (symbol: string, period: string) => void;
  select_sym: (value: number) => void;
}

export const PRICE_CHART_CONTAINER_ID = "tv-price-chart";

const TradingViewChart = () => {
  const tvWidgetRef = useRef<any>(null);
  const [isChartReady, setIsChartReady] = useState(false);
  const stopLossStudyRef = useRef<EntityId | null>(null);
  const takeProfitStudyRef = useRef<EntityId | null>(null);
  const isWidgetReady = tvWidgetRef.current?._ready;
  const { getCandlesForDatafeed } = useReyaChartsClient();
  const { selectedMarket: currentMarket, markets } = useMarketStore();
  const { user } = useUserStore();
  const symbol = currentMarket?.ticker;
  const currentMarketId = currentMarket?.id;
  const currentMarginAccount = user;
  const hasMarketLoaded = notEmpty(symbol) && notEmpty(currentMarketId);
  const positionPerMarket =
    currentMarginAccount?.positions.find(
      (position) => position?.market?.id === currentMarket?.id,
    ) ?? null;

  const { setTvChartResolutionAction, resolution: selectedResolution } =
    usePerpetualsStore();
  const [savedTvChartConfig, setTvChartConfig] = persistValue<
    Record<string, object | undefined>
  >({
    defaultValue: {},
    name: "savedTvChartConfigBySymbol",
  });
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.TradingView?.widget) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "/static/charting_library/charting_library.js";
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    document.head.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [isScriptLoaded, setIsScriptLoaded, setIsChartReady, tvWidgetRef, symbol]);

  const currentSymbolConfig = symbol ? savedTvChartConfig[symbol] : undefined;

  const setVisibleRangeForResolution = ({
    resolution,
  }: {
    resolution: ResolutionString;
  }) => {
    if (!tvWidgetRef.current) {
      return;
    }
    const defaultRange = RESOLUTION_CHART_CONFIGS[resolution];

    const newRange = {
      from: (Date.now() - defaultRange) / 1000,
      to: Date.now() / 1000,
    };
    void tvWidgetRef.current
      .activeChart()
      .setVisibleRange(newRange, { percentRightMargin: 10 });
  };

  const [savedTvChartTimeFrame, setTvChartTimeFrame] = usePersist<
    string | undefined
  >({
    initialValue: "5D",
    stateName: "tvChartTimeFrame",
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const getMarketByTicker = useCallback(
    (ticker: string) => markets.find((market) => market.ticker === ticker),
    [markets],
  );

  useEffect(() => {
    if (!hasMarketLoaded && !isScriptLoaded) {
      return undefined;
    }
    if (
      savedTvChartResolution &&
      savedTvChartResolution !== selectedResolution
    ) {
      setTvChartResolutionAction({ resolution: savedTvChartResolution });
    }
    const widgetOptions: ChartingLibraryWidgetOptions = {
      auto_save_delay: 0.1,
      autosize: true,
      charts_storage_api_version: "1.1",
      charts_storage_url: "https://saveload.tradingview.com",
      client_id:
        // process.env.NEXT_PUBLIC_NODE_ENV === "production"
        //   ?
        "https://app.reya.xyz/",
      // : "https://developapp.reya.xyz/",
      container: PRICE_CHART_CONTAINER_ID,

      custom_css_url: `https://dev.app.zeuz.trade/chart_custom.css`,
      custom_formatters: {
        priceFormatterFactory: (symbolInfo) => {
          const marketTickSizeDecimals = symbolInfo?.ticker
            ? getMarketByTicker(symbolInfo.ticker)?.tickSizeDecimals
            : undefined;
          return {
            format: (price) => {
              return priceFormatter(price, {
                precision: marketTickSizeDecimals,
              });
            },
          };
        },
      },
      custom_indicators_getter: () => {
        return Promise.resolve<CustomIndicator[]>([
          {
            constructor: function (this: LibraryPineStudy<IPineStudyResult>) {
              this.init = function (context) {
                this._context = context;
              };
              this.main = function (context, inputCallback) {
                this._context = context;
                this._input = inputCallback;

                const stopLoss = this._input(0);

                return [{ offset: 0, value: stopLoss }];
              };
            },
            metainfo: {
              _metainfoVersion: 52,
              defaults: {
                inputs: {},
                styles: {
                  plot_0: {
                    color: "#FE356E",
                    linestyle: 2,
                    linewidth: 1,
                    plottype: 0,
                    trackPrice: false,
                    transparency: 0,
                    visible: true,
                  },
                },
              },
              description: "Stop Loss",
              format: {
                precision: 4,
                type: "price",
              },
              id: "sl@tv-basicstudies-1" as RawStudyMetaInfoId,

              inputs: [
                {
                  defval: 0,
                  id: "stopLoss",
                  name: "Stop Loss",
                  type: "float",
                },
              ],
              isCustomIndicator: true,
              is_price_study: true,
              palettes: {
                paletteId1: {
                  colors: {
                    0: {
                      name: "Stop Loss",
                    },
                  },
                },
              },
              plots: [{ id: "plot_0", type: "line" }],
              shortDescription: "Stop Loss",
              styles: {
                plot_0: {
                  histogramBase: 0,
                  joinPoints: true,
                  title: "Stop loss",
                },
              },
            },
            name: "SL",
          },
          {
            constructor: function (this: LibraryPineStudy<IPineStudyResult>) {
              this.init = function (context) {
                this._context = context;
              };
              this.main = function (context, inputCallback) {
                this._context = context;
                this._input = inputCallback;

                const stopLoss = this._input(0);

                return [{ offset: 0, value: stopLoss }];
              };
            },
            metainfo: {
              _metainfoVersion: 52,
              defaults: {
                inputs: {},
                styles: {
                  plot_0: {
                    color: "#04F06A",
                    linestyle: 2,
                    linewidth: 1,
                    plottype: 0,
                    trackPrice: false,
                    transparency: 0,
                    visible: true,
                  },
                },
              },
              description: "Take Profit",
              format: {
                precision: 4,
                type: "price",
              },
              id: "tp@tv-basicstudies-1" as RawStudyMetaInfoId,

              inputs: [
                {
                  defval: 0,
                  id: "takeProfit",
                  name: "Take Profit",
                  type: "float",
                },
              ],
              isCustomIndicator: true,
              is_price_study: true,
              palettes: {
                paletteId1: {
                  colors: {
                    0: {
                      name: "Take Profit",
                    },
                  },
                },
              },
              plots: [{ id: "plot_0", type: "line" }],
              shortDescription: "Take Profit",
              styles: {
                plot_0: {
                  histogramBase: 0,
                  joinPoints: true,
                  title: "Take Profit",
                },
              },
            },
            name: "TP",
          },
        ]);
      },
      datafeed: getReyaDatafeed(getCandlesForDatafeed),
      toolbar_bg: "#17181A",
      disabled_features: [
        "header_symbol_search",
        "header_compare",
        "symbol_search_hot_key",
        "symbol_info",
        "go_to_date",
        "header_saveload",
      ],
      enabled_features: [
        "iframe_loading_compatibility_mode",
        "show_spread_operators",
        "remove_library_container_border",
        "hide_last_na_study_output",
        "dont_show_boolean_study_arguments",
        "hide_left_toolbar_by_default",
      ],
      fullscreen: false,
      interval: savedTvChartResolution as ResolutionString,
      library_path: "https://dev.app.zeuz.trade/static/charting_library/",
      loading_screen: {
        backgroundColor: "#17181a",
        foregroundColor: "#17181a",
      },
      locale: "en" as LanguageCode,
      overrides: {
        // "paneProperties.horzGridProperties.color": "#17181A",
        "paneProperties.backgroundGradientStartColor": "#17181A",
        "paneProperties.backgroundGradientEndColor": "#17181a",
        "paneProperties.background": "#17181a",
        "scalesProperties.textColor": "#FFFFFF",
        "paneProperties.legendProperties.showLegend": true,
        "paneProperties.legendProperties.showStudyArguments": true,
        "paneProperties.legendProperties.showStudyTitles": true,
        "paneProperties.legendProperties.showStudyValues": true,
        "paneProperties.legendProperties.showSeriesTitle": true,
        "paneProperties.legendProperties.showSeriesOHLC": true,
        "mainSeriesProperties.candleStyle.barColorsOnPrevClose": false,
      },
      saved_data:
        currentSymbolConfig && !isEmpty(currentSymbolConfig)
          ? cleanSltp(currentSymbolConfig)
          : undefined,
      studies_overrides: {
        // "relative strength index.hlines background.color": "#17181a",
        // "relative strength index.hlines background.color": "#17181A",
        "relative strength index.plot.color": "#17181a",
        "relative strength index.plot.color": "#FFFFFF",
        // "relative strength index.plot.linewidth": 1.5,
        "volume.volume ma.visible": false,
        "volume.volume.color.0": "#FF0000",
        "volume.volume.color.1": "#00FF00",
        // "relative strength index.plot.linewidth": 1.5,
        "volume.volume ma.visible": false,
      },
      symbol,
      theme: "dark",
      time_frames: [
        {
          description: "3 Months",
          resolution: "1D" as ResolutionString,
          text: "3m",
        },
        {
          description: "1 Month",
          resolution: "60" as ResolutionString,
          text: "1m",
        },
        {
          description: "5 Days",
          resolution: "60" as ResolutionString,
          text: "5d",
        },
        {
          description: "1 Days",
          resolution: "1" as ResolutionString,
          text: "1d",
        },
      ],
      timeframe: savedTvChartTimeFrame,
    };
    tvWidgetRef.current = new widget(widgetOptions);
    let intervalChangeSubscription:
      | ISubscription<
          (
            interval: ResolutionString,
            timeFrameParameters: {
              timeframe?: TimeFrameValue;
            },
          ) => void
        >
      | undefined = undefined;

    const onIntervalChanged = (
      resolution: ResolutionString,
      timeFrameParameters: {
        timeframe?: TimeFrameValue;
      },
    ) => {
      setTvChartResolutionAction({ resolution });
      setVisibleRangeForResolution({ resolution });
      setTvChartResolution(resolution);
      if (timeFrameParameters.timeframe?.type === "period-back") {
        setTvChartTimeFrame(timeFrameParameters.timeframe.value);
      } else {
        setTvChartTimeFrame(undefined);
      }
    };

    tvWidgetRef.current.onChartReady(() => {
      tvWidgetRef.current?.applyOverrides(widgetOptions.overrides!);
      tvWidgetRef.current?.applyStudiesOverrides(
        widgetOptions.studies_overrides!,
      );
      tvWidgetRef.current
        ?.activeChart()
        .executeActionById("drawingToolbarAction");
      setIsChartReady(true);
      const chart = tvWidgetRef.current?.activeChart();
      if (savedTvChartTimeFrame) {
        chart?.setTimeFrame({
          res: savedTvChartResolution,
          val: {
            type: "period-back" as TimeFrameType.PeriodBack,
            value: savedTvChartTimeFrame,
          },
        });
      }
      const chartResolution = chart?.resolution();
      if (chartResolution) {
        setVisibleRangeForResolution({ resolution: chartResolution });
      }
      intervalChangeSubscription = chart?.onIntervalChanged();
      intervalChangeSubscription?.subscribe(null, onIntervalChanged);
      tvWidgetRef?.current?.subscribe("onAutoSaveNeeded", () =>
        tvWidgetRef?.current?.save((chartConfig: object) => {
          const updatedConfig = {
            ...savedTvChartConfig,
            [symbol]: cleanSltp(chartConfig) as object | undefined,
          };
          setTvChartConfig(updatedConfig);
        }),
      );
    });

    return () => {
      if (intervalChangeSubscription) {
        intervalChangeSubscription.unsubscribe(null, onIntervalChanged);
      }
      if (tvWidgetRef.current) {
        tvWidgetRef.current.remove();
      }
      setIsChartReady(false);
    };
  }, [getCandlesForDatafeed, hasMarketLoaded]);

  useEffect(() => {
    if (
      isChartReady &&
      isScriptLoaded &&
      symbol &&
      selectedResolution &&
      isWidgetReady &&
      tvWidgetRef.current &&
      tvWidgetRef.current._innerAPI &&
      tvWidgetRef.current._innerAPI()
    ) {
      tvWidgetRef.current.setSymbol(
        symbol,
        selectedResolution as ResolutionString,
        () => {
          setVisibleRangeForResolution({
            resolution: selectedResolution as ResolutionString,
          });
        },
      );
    }
  }, [selectedResolution, symbol, isWidgetReady]);

  const clearStudies = (chart: IChartWidgetApi) => {
    if (takeProfitStudyRef.current) {
      chart.removeEntity(takeProfitStudyRef.current);
      takeProfitStudyRef.current = null;
    }
    if (stopLossStudyRef.current) {
      chart.removeEntity(stopLossStudyRef.current);
      stopLossStudyRef.current = null;
    }
  };

  const addOrUpdateStopLossStudy = async (
    chart: IChartWidgetApi,
    stopLoss: number | null,
  ) => {
    if (stopLoss && stopLossStudyRef.current) {
      const study = chart.getStudyById(stopLossStudyRef.current);
      study.setInputValues([
        { id: "stopLoss" as StudyInputId, value: stopLoss },
      ]);
      study.setVisible(true);
    } else if (stopLoss && !stopLossStudyRef.current) {
      const studyId = await chart.createStudy("Stop Loss", false, false, {
        stopLoss,
      });
      stopLossStudyRef.current = studyId;
    } else if (stopLossStudyRef.current) {
      const study = chart.getStudyById(stopLossStudyRef.current);
      study.setVisible(false);
    }
  };

  const addOrUpdateTakeProfitStudy = async (
    chart: IChartWidgetApi,
    takeProfit: number | null,
  ) => {
    if (takeProfit && takeProfitStudyRef.current) {
      const study = chart.getStudyById(takeProfitStudyRef.current);
      study.setInputValues([
        { id: "takeProfit" as StudyInputId, value: takeProfit },
      ]);
      study.setVisible(true);
    } else if (takeProfit && !takeProfitStudyRef.current) {
      const studyId = await chart.createStudy("Take Profit", false, false, {
        takeProfit,
      });
      takeProfitStudyRef.current = studyId;
    } else if (takeProfitStudyRef.current) {
      const study = chart.getStudyById(takeProfitStudyRef.current);
      study.setVisible(false);
    }
  };

  useEffect(() => {
    if (
      isChartReady &&
      isScriptLoaded &&
      isWidgetReady &&
      tvWidgetRef.current &&
      tvWidgetRef.current._innerAPI &&
      tvWidgetRef.current._innerAPI()
    ) {
      const chart = tvWidgetRef.current.activeChart();
      if (!chart) {
        return;
      }

      clearStudies(chart);

      const stopLoss =
        positionPerMarket?.conditionalOrdersInfo?.stopLoss?.stopLossPrice ??
        null;
      const takeProfit =
        positionPerMarket?.conditionalOrdersInfo?.takeProfit?.takeProfitPrice ??
        null;

      void addOrUpdateStopLossStudy(chart, stopLoss);
      void addOrUpdateTakeProfitStudy(chart, takeProfit);
    }
  }, [
    positionPerMarket?.id,
    isWidgetReady,
    isChartReady,
    currentMarketId,
    positionPerMarket?.conditionalOrdersInfo?.stopLoss?.stopLossPrice,
    positionPerMarket?.conditionalOrdersInfo?.takeProfit?.takeProfitPrice,
  ]);

  useEffect(() => {
    if (
      !isScriptLoaded ||
      !isWidgetReady ||
      !symbol ||
      !isChartReady ||
      !tvWidgetRef.current
    ) {
      return;
    }
    if (symbol && !isEmpty(savedTvChartConfig[symbol])) {
      const updatedConfig = {
        ...savedTvChartConfig,
        [symbol]: savedTvChartConfig[symbol],
      };
      setTvChartConfig(updatedConfig);
    }
  }, [symbol]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
      }}
      ref={containerRef}
      id={PRICE_CHART_CONTAINER_ID}
    />
  );
};

export default TradingViewChart;
