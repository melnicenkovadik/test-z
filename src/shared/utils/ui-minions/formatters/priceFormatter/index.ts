import { isEmpty } from "@/shared/utils/ui-minions";

/**
 * Rounds down a number to the specified precision.
 *
 * @param {number} value - The number to round down.
 * @param {number} precision - The number of decimal places to round down to.
 * @returns {number} The rounded down number.
 */
function roundDown(value: number, precision: number) {
  const roundDownBy = Math.pow(10, precision);
  return Math.trunc(value * roundDownBy) / roundDownBy;
}

export type PriceFormatterOptions = {
  defaultValue?: string;
  locale: string;
  padTrailingZeros?: boolean;
  precision: number;
  useGrouping?: Intl.NumberFormatOptions["useGrouping"];
};

/**
 * Formats a price value into a string based on the provided options.
 *
 * @param {number} value - The price value to be formatted.
 * @param {Options} [options={}] - The options for formatting.
 * @param {string} [options.defaultValue] - The default value if the input is empty. Defaults to '---'.
 * @param {string} [options.locale] - The locale for formatting.
 * @param {number} [options.precision] - The number of decimal places to format to.
 * @param {Intl.NumberFormatOptions['useGrouping']} [options.useGrouping] - Whether to use grouping separators.
 * @returns {string} The formatted price string.
 */
export function priceFormatter(value: number, options?: any): string {
  const {
    defaultValue = "---",
    locale = "en-US",
    useGrouping = undefined,
    precision = 2,
    padTrailingZeros = false,
  } = { ...options };

  if (isEmpty(value) || typeof value !== "number" || isNaN(value)) {
    return defaultValue;
  }

  if (value === 0) {
    return "0";
  }

  const rounded = roundDown(value, precision);
  const localeFormatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: precision,
    minimumFractionDigits: padTrailingZeros ? precision : 0,
    useGrouping,
  });

  let formatted = localeFormatter.format(rounded);

  const decimalSeparator = (1.1).toLocaleString(locale).charAt(1);
  if (formatted.endsWith(decimalSeparator)) {
    formatted = formatted.slice(0, -1);
  }

  return formatted;
}
