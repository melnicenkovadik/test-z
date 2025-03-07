export const findPositionByOrder = (positions: any, order: any) => {
  let orderField: any = null;
  if (order.orderType === "Take Profit") {
    orderField = "takeProfit";
  } else if (order.orderType === "Stop Loss") {
    orderField = "stopLoss";
  } else {
    return null;
  }

  return (
    // @ts-ignore
    positions.find((position) => {
      if (
        position.accountId !== order.accountId ||
        position.marketId !== order.marketId
      ) {
        return false;
      }
      if (
        !position.conditionalOrdersInfo ||
        !position.conditionalOrdersInfo[orderField] ||
        !position.conditionalOrdersInfo[orderField].orderId
      ) {
        return false;
      }

      return (
        position.conditionalOrdersInfo[orderField].orderId === order.orderId
      );
    }) || null
  );
};
