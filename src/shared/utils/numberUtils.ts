export const calculateOrderMoney = (
  assetPrice: number,
  amount: number,
): number => {
  return Number(Math.abs(amount * assetPrice).toFixed(2));
};

export const roundOffNumber = (input: number): number => {
  if (input === 0 || input === undefined) {
    return 0;
  }

  const log10 = Math.abs(Math.log10(input));
  const result = parseFloat(input.toFixed(log10 + 1));

  return isNaN(result) ? 0 : result;
};

export const roundWithPlaces = (
  input: number,
  decimalPlaces: number = 2,
): number => {
  if (input === 0 || input === undefined) {
    return 0;
  }

  return parseFloat(input.toFixed(decimalPlaces));
};

export const formatNumber = (input: number): string => {
  const inputValue = +input;
  if (inputValue === 0 || inputValue === undefined) {
    return "0";
  }

  return inputValue?.toLocaleString?.("en-US");
};

export const shortenString = (str: string, length = 6): string => {
  if (!str) {
    return "";
  }

  return `${str.slice(0, length)}...${str.slice(-length)}`;
};
