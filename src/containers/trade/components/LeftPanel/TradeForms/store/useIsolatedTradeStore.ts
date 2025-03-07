import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { DIRECTION_TYPE } from "@/containers/trade/components/LeftPanel/trade-panel.types";
import type {
  IsolatedTradeParams,
  IsolatedTradeResult,
} from "@/services/trade-form/isolatedTradeService";
import { isolatedTradeService } from "@/services/trade-form/isolatedTradeService";
import { simulateIsolatedTradeService } from "@/services/trade-form/simulateIsolatedTradeService";
import type { SimulateIsolatedTradeParams } from "@/services/trade-form/simulateIsolatedTradeService";
import { mapSimulateIsolatedTradeResultToSimulateIsolatedTradeUI } from "@/shared/utils/_common/mappers/mapSimulateIsolatedTradeResultToSimulateIsolatedTradeUI";

type SimulationResult = ReturnType<
  typeof mapSimulateIsolatedTradeResultToSimulateIsolatedTradeUI
>;
type FetchStatus = "idle" | "loading" | "success" | "error";

type IsolatedTradeState = {
  maxOrderSizeAvailable: number;
  maxOrderSizeStatus: FetchStatus;
  maxOrderSizeError: string | null;
  simulation: SimulationResult | null;
  simulationStatus: FetchStatus;
  simulationError: string | null;

  fetchMaxOrderSize: (params: {
    marketId: number;
    direction: DIRECTION_TYPE;
    marginAccountId: number;
  }) => Promise<void>;

  simulateTrade: (
    params: Omit<SimulateIsolatedTradeParams, "fromBase">,
  ) => Promise<void>;

  executeTrade: (
    params: IsolatedTradeParams,
  ) => Promise<IsolatedTradeResult | null>;
};

export const useIsolatedTradeStore = create<IsolatedTradeState>()(
  devtools((set) => ({
    maxOrderSizeAvailable: 0,
    maxOrderSizeStatus: "idle",
    maxOrderSizeError: null,

    simulation: null,
    simulationStatus: "idle",
    simulationError: null,

    async simulateTrade({ amount, isolatedPositionLeverage }) {
      set({ simulationStatus: "loading", simulationError: null });
      try {
        const simulateParams: SimulateIsolatedTradeParams = {
          amount,
          fromBase: false,
          isolatedPositionLeverage,
        };

        const simulationResponse =
          await simulateIsolatedTradeService(simulateParams);
        const mappedUI =
          mapSimulateIsolatedTradeResultToSimulateIsolatedTradeUI(
            simulationResponse,
          );

        set({
          simulation: mappedUI,
          simulationStatus: "success",
        });
      } catch (error: any) {
        set({
          simulationStatus: "error",
          simulationError: error?.message || "Simulation error",
        });
      }
    },
    async executeTrade(params) {
      try {
        const result = await isolatedTradeService(params);
        return result;
      } catch {
        return null;
      }
    },
  })),
);
