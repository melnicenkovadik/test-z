import { useCallback } from "react";

import {
  registerConditionalOrderService,
  updateConditionalOrderService,
  cancelConditionalOrderService,
  // Типы
  RegisterConditionalOrderParams,
  UpdateConditionalOrderParams,
  CancelConditionalOrderParams,
} from "@/services/conditional-orders/services";

export function useConditionalOrders() {
  const registerConditionalOrder = useCallback(
    async (params: RegisterConditionalOrderParams) => {
      // Здесь можно добавить базовые проверки:
      if (!params.signer) throw new Error("No signer");
      // if (!params.triggerPrice || params.triggerPrice <= 0) {
      //   throw new Error("Trigger price must be > 0");
      // }

      const result = await registerConditionalOrderService(params);
      return result;
    },
    [],
  );

  const updateConditionalOrder = useCallback(
    async (params: UpdateConditionalOrderParams) => {
      if (!params.signer) throw new Error("No signer");
      if (!params.cancelOrderId) throw new Error("No orderId to update");
      // if (!params.triggerPrice || params.triggerPrice <= 0) {
      //   throw new Error("Trigger price must be > 0");
      // }

      const result = await updateConditionalOrderService(params);
      return result;
    },
    [],
  );

  const cancelConditionalOrder = useCallback(
    async (params: CancelConditionalOrderParams) => {
      if (!params.signer) throw new Error("No signer");
      if (!params.orderId) throw new Error("No orderId to cancel");

      const result = await cancelConditionalOrderService(params);
      return result;
    },
    [],
  );
  return {
    registerConditionalOrder,
    updateConditionalOrder,
    cancelConditionalOrder,
  };
}
