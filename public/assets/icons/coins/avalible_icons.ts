// 1. Початкові дані для старих іконок (значення шляхів оновлено)
const rawOldIcons = {
  AAVE: "/assets/icons/coins/AAVE.svg",
  ADA: "/assets/icons/coins/ADA.svg",
  APT: "/assets/icons/coins/APT.svg",
  ARB: "/assets/icons/coins/ARB.svg",
  AVAX: "/assets/icons/coins/AVAX.svg",
  BNB: "/assets/icons/coins/BNB.svg",
  BTC: "/assets/icons/coins/BTC.svg",
  CRV: "/assets/icons/coins/CRV.svg",
  DOGE: "/assets/icons/coins/DOGE.svg",
  EIGEN: "/assets/icons/coins/EIGEN.svg",
  ENA: "/assets/icons/coins/ENA.svg",
  ETH: "/assets/icons/coins/ETH.svg",
  FTM: "/assets/icons/coins/FTM.svg",
  GOAT: "/assets/icons/coins/GOAT.svg",
  GRASS: "/assets/icons/coins/GRASS.svg",
  JTO: "/assets/icons/coins/JTO.svg",
  kBONK: "/assets/icons/coins/kBONK.svg",
  kNEIRO: "/assets/icons/coins/kNEIRO.svg",
  kPEPE: "/assets/icons/coins/kPEPE.svg",
  kSHIB: "/assets/icons/coins/kSHIB.svg",
  LDO: "/assets/icons/coins/LDO.svg",
  LINK: "/assets/icons/coins/LINK.svg",
  MKR: "/assets/icons/coins/MKR.svg",
  BERA: "/assets/icons/coins/BERA.svg",
  LAYER: "/assets/icons/coins/LAYER.svg",
  NEAR: "/assets/icons/coins/NEAR.svg",
  OP: "/assets/icons/coins/OP.svg",
  PENDLE: "/assets/icons/coins/PENDLE.svg",
  POL: "/assets/icons/coins/POL.svg",
  POPCAT: "/assets/icons/coins/POPCAT.svg",
  SEI: "/assets/icons/coins/SEI.svg",
  SOL: "/assets/icons/coins/SOL.svg",
  SUI: "/assets/icons/coins/SUI.svg",
  TIA: "/assets/icons/coins/TIA.svg",
  UNI: "/assets/icons/coins/UNI.svg",
  WIF: "/assets/icons/coins/WIF.svg",
  XRP: "/assets/icons/coins/XRP.svg",
  ZRO: "/assets/icons/coins/ZRO.svg",
};

// 2. Початкові дані для нових іконок (значення шляхів оновлено)
const rawNewIcons = {
  AAVE: "/assets/icons/coins/new/aave-logo.svg",
  ADA: "/assets/icons/coins/new/ada-logo.svg",
  APE: "/assets/icons/coins/new/ape-logo.svg",
  APT: "/assets/icons/coins/new/apt-logo.svg",
  ARB: "/assets/icons/coins/new/arb-logo.svg",
  ATOM: "/assets/icons/coins/new/atom-logo.svg",
  AVAX: "/assets/icons/coins/new/avax-logo.svg",
  BNB: "/assets/icons/coins/new/bnb-logo.svg",
  BONK: "/assets/icons/coins/new/bonk-logo.svg",
  BTC: "/assets/icons/coins/new/btc-logo.svg",
  CRV: "/assets/icons/coins/new/crv-logo.svg",
  DOGE: "/assets/icons/coins/new/doge-logo.svg",
  DOT: "/assets/icons/coins/new/dot-logo.svg",
  EIGEN: "/assets/icons/coins/new/eigen-logo.svg",
  ENA: "/assets/icons/coins/new/ena-logo.svg",
  ETH: "/assets/icons/coins/new/eth-logo.svg",
  FTM: "/assets/icons/coins/new/ftm-logo.svg",
  GOAT: "/assets/icons/coins/new/goat-logo.svg",
  INJ: "/assets/icons/coins/new/inj-logo.svg",
  JUP: "/assets/icons/coins/new/jup-logo.svg",
  LDO: "/assets/icons/coins/new/ldo-logo.svg",
  LINK: "/assets/icons/coins/new/link-logo.svg",
  LTC: "/assets/icons/coins/new/ltc-logo.svg",
  MKR: "/assets/icons/coins/new/mkr-logo.svg",
  NEAR: "/assets/icons/coins/new/near-logo.svg",
  ONDO: "/assets/icons/coins/new/ondo-logo.svg",
  OP: "/assets/icons/coins/new/op-logo.svg",
  PENDLE: "/assets/icons/coins/new/pendle-logo.svg",
  PEPE: "/assets/icons/coins/new/pepe-logo.svg",
  POL: "/assets/icons/coins/new/pol-logo.svg",
  POPCAT: "/assets/icons/coins/new/popcat-logo.svg",
  PYTH: "/assets/icons/coins/new/pyth-logo.svg",
  SEI: "/assets/icons/coins/new/sei-logo.svg",
  SHIB: "/assets/icons/coins/new/shib-logo.svg",
  SOL: "/assets/icons/coins/new/sol-logo.svg",
  SUI: "/assets/icons/coins/new/sui-logo.svg",
  TIA: "/assets/icons/coins/new/tia-logo.svg",
  TON: "/assets/icons/coins/new/ton-logo.svg",
  TRX: "/assets/icons/coins/new/trx-logo.svg",
  UNI: "/assets/icons/coins/new/uni-logo.svg",
  VIRTUAL: "/assets/icons/coins/new/virtual-logo.svg",
  WIF: "/assets/icons/coins/new/wif-logo.svg",
  WLD: "/assets/icons/coins/new/wld-logo.svg",
  XRP: "/assets/icons/coins/new/xrp-logo.svg",
  ZRO: "/assets/icons/coins/new/zro-logo.svg",
};

// 3. Функція нормалізації ключів залишається без змін
const normalizeKeys = (
  iconsObj: Record<string, string>,
): Record<string, string> =>
  Object.entries(iconsObj).reduce(
    (acc, [key, value]) => {
      acc[key?.toUpperCase()] = value;
      return acc;
    },
    {} as Record<string, string>,
  );

// 4. Нормалізовані об’єкти старих і нових іконок
export const oldIcons = normalizeKeys(rawOldIcons);
export const newIcons = normalizeKeys(rawNewIcons);

// 5. Об’єднаний об’єкт іконок
export const icons = {
  ...oldIcons,
  ...newIcons,
};

// 6. Функція перевірки наявності іконки
export const hasIcon = (iconName: string): boolean => {
  return Object.prototype.hasOwnProperty.call(icons, iconName?.toUpperCase());
};

// 7. Функція для отримання шляху до іконки
export const getIcon = (iconName: string): string | undefined => {
  return icons[iconName?.toUpperCase()];
};
