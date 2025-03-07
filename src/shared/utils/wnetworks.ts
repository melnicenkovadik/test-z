export class Network {
  networkName: string;
  usdcAddress: string;
  chainId: number;
  token: string;

  constructor(
    networkName: string,
    usdcAddress: string,
    chainId: number,
    token: string,
  ) {
    this.networkName = networkName;
    this.usdcAddress = usdcAddress;
    this.chainId = chainId;
    this.token = token;
  }
}

export function getNetworks(): Network[] {
  return [
    new Network(
      "Ethereum",
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      1,
      "ETH",
    ),
    new Network(
      "Optimism",
      "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
      10,
      "OP",
    ),
    new Network(
      "Polygon",
      "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      137,
      "POL",
    ),
    new Network(
      "Arbitrum",
      "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
      42161,
      "ARB",
    ),
    new Network(
      "Base",
      "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      8453,
      "Base",
    ),
  ];
}
