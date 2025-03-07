import { useEffect, useRef } from "react";

import { DIRECTION_TYPE } from "@/containers/trade/components/LeftPanel/trade-panel.types";
import { getLimitOrderSizeAvailableService } from "@/services/trade-form/cross-margin-trade-form/getLimitOrderMaxOrderSizeAvailableService";
import { getMaxOrderSizeAvailableService } from "@/services/trade-form/cross-margin-trade-form/getMaxOrderSizeAvailableService";

type UseCrossMarginTradeMaxOrderSizeAvailablePollingParams = {
  direction: DIRECTION_TYPE;
  marginAccountId?: number;
  marketId?: number;
  /**
   * Интервал поллинга в мс (по умолчанию 5 сек)
   */
  pollingInterval?: number;
  /**
   * set-функция для записи актуального значения
   */
  setMaxAvailableOrderSize: React.Dispatch<
    React.SetStateAction<{
      maxAmountBase: number;
      maxAmountSize: number;
    } | null>
  >;
  isLimitOrder?: boolean;
  limitPrice?: string | null;
};

/**
 * БЕРЕЖНЫЙ ПОЛЛИНГ:
 * Используем рекурсивный setTimeout и флаг "отмены",
 * чтобы не вызывать новый запрос, пока не завершился предыдущий,
 * и корректно очищать таймер при размонтировании.
 */
export const useCrossMarginTradeMaxOrderSizeAvailablePolling = ({
  isLimitOrder = false,
  limitPrice = null,
  direction,
  marginAccountId,
  marketId,
  pollingInterval = 5000,
  setMaxAvailableOrderSize,
}: UseCrossMarginTradeMaxOrderSizeAvailablePollingParams) => {
  const isUnmountedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isUnmountedRef.current = false;

    if (!marketId || !marginAccountId) return;

    const fetchMaxOrderSize = async () => {
      try {
        const maxOrderSize =
          isLimitOrder && limitPrice
            ? await getLimitOrderSizeAvailableService({
                triggerPrice: parseFloat(String(limitPrice || "0")),
              })
            : await getMaxOrderSizeAvailableService({
                direction,
                marginAccountId,
                marketId,
              });
        if (isUnmountedRef.current) return;

        setMaxAvailableOrderSize(maxOrderSize);
      } catch (error) {
        console.error("Error polling max order size:", error);
      }
    };

    /**
     * Рекурсивная функция для поллинга.
     * Запрашиваем данные, дожидаемся ответа, запускаем новый таймер,
     * и уже после его срабатывания (по истечении pollingInterval) повторяем цикл.
     */
    const startPolling = async () => {
      await fetchMaxOrderSize(); // дожидаемся ответа
      if (isUnmountedRef.current) return;

      timerRef.current = setTimeout(startPolling, pollingInterval);
    };

    void startPolling();

    return () => {
      isUnmountedRef.current = true;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [
    direction,
    marginAccountId,
    marketId,
    pollingInterval,
    setMaxAvailableOrderSize,
  ]);
};
