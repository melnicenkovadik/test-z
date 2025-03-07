import { UnifiedConditionalOrderType } from "@/services/conditional-orders/services";
import { UnifiedConditionalOrderTypeUI } from "@/services/conditional-orders/types";
import {
  capitalize,
  defaultNumberCompactFormatter,
  formatTimeAgo,
} from "@/shared/utils/ui-minions";

export const mapConditionalOrderEntityToConditionalOrderEntityUI = (
  entity: UnifiedConditionalOrderType,
): UnifiedConditionalOrderTypeUI | null => {
  if (!entity) {
    return null;
  }

  return {
    ...entity,
    base: entity.base,
    baseFormatted: entity.base
      ? defaultNumberCompactFormatter(Math.abs(entity.base))
      : "--",
    orderType: entity.orderType,
    orderTypeFormatted: entity.orderType ? entity.orderType : "Other",
    price: entity.price,
    priceFormatted: defaultNumberCompactFormatter(entity.price),
    status: entity.status,
    statusFormatted: capitalize(entity.status),
    timestampFormatted: formatTimeAgo(entity.timestampMs),
  };
};
