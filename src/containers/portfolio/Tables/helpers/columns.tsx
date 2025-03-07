import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import Image from "next/image";

import s from "@/containers/portfolio/Tables/Table.module.scss";
import { TTabName } from "@/containers/portfolio/Tables/tables.types";
import Health from "@/shared/components/Header/MarginRatio";
import { Button } from "@/shared/components/ui/Button/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/Tooltip";
import useUserStore from "@/shared/store/user.store";
import { findPositionByOrder } from "@/shared/utils/findPositionByOrder";
import { isProduction } from "@/shared/utils/project-env";
import { capitalize } from "@/shared/utils/ui-minions";

import {
  getIcon,
  hasIcon,
} from "../../../../../public/assets/icons/coins/avalible_icons";

export const PORTFOLIO_TABS: TTabName[] = [
  "Overview",
  "Positions",
  "Orders",
  "History",
  "Transfers",
];

export const TRADE_TABS: TTabName[] = ["Positions", "Orders", "History"];
export const MANAGE_ACCOUNT_TABS: TTabName[] = ["Summary"];

type IColumnData = any;

export const columnHelper = createColumnHelper<IColumnData>();

/** Overview Columns */

//// // // // // // // // // // // // // // // // // // // // //

export const overviewColumns = [
  columnHelper.accessor("overviewToken", {
    header: "Assets",
    cell: (info) => {
      const row = info.row.original;
      const token = row.token;
      const tokenName = token
        ? token.charAt(0).toLowerCase() + token.slice(1)
        : "";
      return tokenName;
    },
  }),
  columnHelper.accessor("overviewBalanceFormatted", {
    header: "Amount Token",
    cell: (info) => {
      const row = info.row.original;
      return row.balanceFormatted?.value;
    },
  }),
  columnHelper.accessor("overviewBalanceRUSDFormatted", {
    header: "Value rUSD",
    cell: (info) => {
      const row = info.row.original;
      return row.balanceRUSDFormatted?.value;
    },
  }),
];

/** Positions Columns */

//// // // // // // // // // // // // // // // // // // // // //

export const positionsColumns = [
  columnHelper.accessor("positionsMarket", {
    header: "Market",
    cell: (info) => {
      const market = info.row.original.market;
      const tokenName = market?.quoteToken;
      let icon = null;
      if (isProduction && !hasIcon(info?.row.original.tokenName)) {
        icon = null;
      } else {
        icon = getIcon(tokenName);
      }
      const row = info.row.original;
      return (
        <div className={s.market}>
          {icon ? (
            <Image src={icon} alt={tokenName} width={24} height={24} />
          ) : (
            ""
          )}
          {row?.market?.ticker}
        </div>
      );
    },
  }),
  columnHelper.accessor("positionsSide", {
    header: "Side",
    cell: (info) => {
      const row = info.row.original;
      const value = row.side;
      const isLong = value === "long";
      const color = isLong ? "var(--green)" : "var(--red)";
      return <span style={{ color }}>{isLong ? "Long" : "Short"}</span>;
    },
  }),
  columnHelper.accessor("positionsBaseFormatted", {
    header: "Size (Base)",
    cell: (info) => {
      const row = info.row.original;
      return row.baseFormatted?.value;
    },
  }),
  columnHelper.accessor("positionsSizeFormatted", {
    header: "Size (rUSD)",
    cell: (info) => {
      const row = info.row.original;
      return row.sizeFormatted?.value;
    },
  }),
  columnHelper.accessor("positionsPriceFormatted", {
    header: "Entry Price",
    cell: (info) => {
      const row = info.row.original;
      return row.priceFormatted;
    },
  }),
  columnHelper.accessor("positionsConditionalOrdersInfo", {
    header: "SL/TP (rUSD)",
    cell: (info) => {
      const row = info.row.original;
      const { stopLoss, takeProfit } = row.conditionalOrdersInfo || {};
      return (
        <div className={s.sl_tp}>
          <div style={{ position: "relative" }}>
            <div>
              {stopLoss?.priceFormatted || "--"}
              <span style={{ marginLeft: 4 }}>SL</span>
            </div>
            <div>
              {takeProfit?.priceFormatted || "--"}
              <span style={{ marginLeft: 4 }}>TP</span>
            </div>
          </div>
        </div>
      );
    },
  }),
  columnHelper.accessor("positionsTotalPnlFormatted", {
    header: "PnL",
    cell: (info) => {
      const row = info.row.original;
      const value = row.totalPnlFormatted?.value;
      const color =
        value && !value.toString().includes("-")
          ? "var(--green)"
          : "var(--red)";
      return <span style={{ color }}>{value}</span>;
    },
  }),
  columnHelper.accessor("positionsActionClose", {
    header: "Actions",
    cell: () => <button className={s.action_close}>Close</button>,
  }),
  columnHelper.accessor("positionsMarkPriceFormatted", {
    header: "Mark Price",
    cell: (info) => {
      const row = info.row.original;
      return row.markPriceFormatted?.value;
    },
  }),
  columnHelper.accessor("positionsLiquidationPriceFormatted", {
    header: "Liquidation Price",
    cell: (info) => {
      const row = info.row.original;
      return row.liquidationPriceFormatted?.value;
    },
  }),
  columnHelper.accessor("positionsFundingRateFormatted", {
    header: "Funding Rate",
    cell: (info) => {
      const row = info.row.original;
      const fundingRate = row?.market?.fundingRateFormatted;
      const value = fundingRate ? fundingRate + "%" : "--";
      const color =
        value && !value.toString().includes("-")
          ? "var(--green)"
          : "var(--red)";
      return <span style={{ color }}>{value}</span>;
    },
  }),
];

/** History Columns */

//// // // // // // // // // // // // // // // // // // // // //

export const historyColumns = [
  columnHelper.accessor("historyMarket", {
    header: "Market",
    cell: (info) => {
      const market = info.row.original.market;
      const tokenName = market?.quoteToken;
      let icon = null;
      if (isProduction && !hasIcon(info?.row.original.tokenName)) {
        icon = null;
      } else {
        icon = getIcon(tokenName);
      }
      const row = info.row.original;
      return (
        <div className={s.market}>
          {icon ? (
            <Image src={icon} alt={tokenName} width={24} height={24} />
          ) : (
            ""
          )}
          {row?.market?.ticker}
        </div>
      );
    },
  }),
  columnHelper.accessor("historySide", {
    header: "Side",
    cell: (info) => {
      const row = info.row.original;
      const value = row.action;
      const isLong = value === "long-trade";
      const color = isLong ? "var(--green)" : "var(--red)";
      return <span style={{ color }}>{isLong ? "Long" : "Short"}</span>;
    },
  }),
  columnHelper.accessor("historyBaseFormatted", {
    header: "Size (Base)",
    cell: (info) => {
      const row = info.row.original;
      const base = Number(row.baseFormatted?.value);
      return base ? base.toFixed(4) : "--";
    },
  }),
  columnHelper.accessor("historySize", {
    header: "Size (rUSD)",
    cell: (info) => {
      const row = info.row.original;
      const { base, executionPrice } = row;
      return base && executionPrice ? (base * executionPrice).toFixed(4) : "--";
    },
  }),
  columnHelper.accessor("historyExecutionPriceFormatted", {
    header: "Entry Price",
    cell: (info) => {
      const row = info.row.original;
      return row.executionPriceFormatted;
    },
  }),
  columnHelper.accessor("historyPnlNetValueFormatted", {
    header: "PnL",
    cell: (info) => {
      const row = info.row.original;
      const value = row.pnlNetValueFormatted?.value;
      const color =
        value && !value.toString().includes("-")
          ? "var(--green)"
          : "var(--red)";
      return <span style={{ color }}>{value}</span>;
    },
  }),
  columnHelper.accessor("historyTimestampFormatted", {
    header: "Time",
    cell: (info) => {
      const row = info.row.original;
      const timestamp = row.timestamp;
      const fullFormatedDate = format(
        new Date(timestamp),
        "yyyy-MM-dd, HH:mm:ss",
      );
      const timestampFormated = row.timestampFormatted;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span>{timestampFormated}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{fullFormatedDate}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  }),
];

/** Transfers Columns */

//// // // // // // // // // // // // // // // // // // // // //

export const transfersColumns = [
  columnHelper.accessor("transfersType", {
    header: "Type",
    cell: (info) => {
      const row = info.row.original;
      const value = row.type?.toLowerCase();
      const detectType = (val: string) => {
        if (val.includes("withdraw")) return "Withdrawal";
        if (val.includes("deposit")) return "Deposit";
        return "Transfer";
      };
      const typeName = value ? detectType(value) : "";
      const color =
        typeName === "Withdrawal"
          ? "var(--red)"
          : typeName === "Deposit"
            ? "var(--green)"
            : "var(--text-color)";
      return (
        <span className={s.transfer_type} style={{ color }}>
          <Image
            width={16}
            height={16}
            src={`/assets/${typeName.toLowerCase()}_icon.svg`}
            alt={typeName}
          />
          {typeName}
        </span>
      );
    },
  }),
  columnHelper.accessor("transfersTime", {
    header: "Time",
    cell: (info) => {
      const row = info.row.original;
      const timestamp = row.timestamp;
      const fullFormatedDate = format(
        new Date(timestamp),
        "yyyy-MM-dd, HH:mm:ss",
      );
      const shortDate = new Date(timestamp).toLocaleDateString("en-GB", {
        month: "short",
        day: "numeric",
      });
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span>{shortDate}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{fullFormatedDate}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  }),
  columnHelper.accessor("transfersAmount", {
    header: "Amount",
    cell: (info) => {
      const row = info.row.original;
      const value = row.amount;
      return `${parseFloat(value).toFixed(2)}`;
    },
  }),
  columnHelper.accessor("transfersTransactionLink", {
    header: "Transaction",
    cell: (info) => {
      const row = info.row.original;
      const link = row.transactionLink;
      return (
        <div className={s.transfer_link_wrap}>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className={s.transfer_link}
          >
            View
          </a>
          <svg
            className={s.transfer_link_arrow}
            viewBox="0 0 6 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            data-testid="ExternalLink-LinkArrow"
          >
            <path
              d="M1 5.004 4.846.996M1 .996h3.846v3.846"
              stroke="#857EA5"
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
        </div>
      );
    },
  }),
];

/** Orders Columns */
//// // // // // // // // // // // // // // // // // // // // //

export const ordersHistoryColumns = [
  columnHelper.accessor("ordersHistoryMarket", {
    cell: (info) => {
      const market = info.row.original.market;
      const tokenName = market?.quoteToken;
      let icon = null;
      if (isProduction && !hasIcon(info?.row.original.tokenName)) {
        icon = null;
      } else {
        icon = getIcon(tokenName);
      }
      const row = info.row.original;
      return (
        <div className={s.market}>
          {icon ? (
            <Image src={icon} alt={tokenName} width={24} height={24} />
          ) : (
            ""
          )}
          {row?.market?.ticker}
        </div>
      );
    },
  }),
  columnHelper.accessor("ordersHistorySide", {
    header: "Side",
    cell: (info) => {
      const row = info.row.original;
      const value = row.base;
      const isShort = value?.toString().includes("-");
      const color = !isShort ? "var(--green)" : "var(--red)";
      return <span style={{ color }}>{!isShort ? "Long" : "Short"}</span>;
    },
  }),
  columnHelper.accessor("ordersHistoryStatus", {
    header: "Status",
    cell: (info) => {
      const row = info.row.original;
      return capitalize(row.status);
    },
  }),
  columnHelper.accessor("ordersHistoryOrderType", {
    header: "Order Type",
    cell: (info) => {
      const row = info.row.original;
      return row.orderType;
    },
  }),
  columnHelper.accessor("ordersHistoryBaseFormatted", {
    header: "Size (Base)",
    cell: (info) => {
      const row = info.row.original;
      const positions = useUserStore?.getState()?.user?.positions;
      const foundPosition = findPositionByOrder(positions, row);
      return foundPosition?.base || row?.baseFormatted?.value || "--";
    },
  }),
  columnHelper.accessor("ordersHistoryPrice", {
    header: "Trigger Price",
    cell: (info) => {
      const row = info.row.original;
      return row.price;
    },
  }),
  columnHelper.accessor("ordersHistoryTimestampFormatted", {
    header: "Time",
    cell: (info) => {
      const row = info.row.original;
      return row.timestampFormatted;
    },
  }),
  columnHelper.accessor("ordersHistoryActionClose", {
    header: "Actions",
    cell: () => <button className={s.action_close}>Close</button>,
  }),
];

//// // // // // // // // // // // // // // // // // // // // //

export const summaryColumns = [
  // Account Name
  columnHelper.accessor("summaryName", {
    header: "Account Name",
    cell: (info) => {
      const row = info.row.original;
      return row.name;
    },
  }),
  // Positions (кількість позицій)
  columnHelper.accessor("summaryPositions", {
    header: "Positions",
    cell: (info) => {
      const positions = info?.row?.original?.totalPositionsCount;
      return positions;
    },
  }),
  // Balance (rUSD)
  columnHelper.accessor("summarytotalBalanceFormatted", {
    header: "Balance (rUSD)",
    cell: (info) => {
      const row = info.row.original;
      return row.totalBalanceFormatted?.value;
    },
  }),
  // 24h Change (додаємо знак залежно від напряму)
  columnHelper.accessor("summary24hChange", {
    header: "24h Change",
    cell: (info) => {
      const row = info.row.original;
      const value = row?.balanceChange24HPercentageFormatted;
      const isPositive = +value >= 0;
      const color = isPositive ? "var(--green)" : "var(--red)";
      return (
        <span style={{ color }}>
          {isPositive ? (
            <Image
              src={`assets/icons/arr_long.svg`}
              alt="change"
              width={10}
              height={10}
            />
          ) : (
            <Image
              src={`assets/icons/arr_short.svg`}
              alt="change"
              width={10}
              height={10}
            />
          )}
          &nbsp;
          {value}%
        </span>
      );
    },
  }),
  // Health
  columnHelper.accessor("summarymarginRatioHealth", {
    header: "Health",
    cell: (info) => {
      const row = info.row.original;
      const marginRatioPercentage = row?.marginRatioPercentage;
      const marginRatioHealth = row?.marginRatioHealth;
      return (
        <Health
          showInfo={false}
          ratioPercentage={marginRatioPercentage}
          ratioHealth={marginRatioHealth}
        />
      );
    },
  }),
  columnHelper.accessor("summarylivePNLFormatted", {
    header: "Unrealised PnL",
    cell: (info) => {
      const row = info.row.original;
      const value =
        +row?.livePNLFormatted?.value !== 0
          ? row?.livePNLFormatted?.value
          : "---";
      const color =
        value === "0" || value === "---"
          ? "#fff"
          : value > 0
            ? "var(--green)"
            : "var(--red)";
      return <span style={{ color }}>{value}</span>;
    },
  }),
  columnHelper.accessor("summarylivePNL", {
    header: "PnL",
    cell: (info) => {
      const row = info.row.original;
      const value =
        +row?.realizedPNLFormatted?.value !== 0
          ? row?.realizedPNLFormatted?.value
          : "---";
      const color =
        value === "0" || value === "---"
          ? "#fff"
          : value > 0
            ? "var(--green)"
            : "var(--red)";
      return <span style={{ color }}>{value}</span>;
    },
  }),
  columnHelper.accessor("summaryActionCloseAll", {
    header: "Actions",
    cell: () => {
      return (
        <div className={s.action_close_all}>
          <Button variant={"system"} id="action_close">
            Close All
          </Button>
          <Button variant={"system"} id="action_edit">
            <img
              id="action_edit"
              src={`assets/icons/edit_icon.svg`}
              alt="edit"
              width={16}
              height={16}
            />
          </Button>
        </div>
      );
    },
  }),
];
