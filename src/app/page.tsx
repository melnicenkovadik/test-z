import { Metadata } from "next";

import TradePage from "@/containers/trade/tradePage";

export const metadata: Metadata = {
  metadataBase: new URL("https://app.zeuz.trade"),
  title: "Trade Dashboard - ZEUZ",
  description: "Trade Dashboard - ZEUZ",
  openGraph: {
    title: "Zeuz",
    description: "Trade Dashboard - ZEUZ",
    url: "https://app.zeuz.trade/",
    siteName: "Zeuz",
    images: [
      {
        url: "/assets/banners/banner_zeus.png",
        width: 1200,
        height: 630,
        alt: "Zeuz",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zeuz",
    description: "Trade Dashboard - ZEUZ",
    images: ["/assets/banners/banner_zeus.png"],
  },
};

export default function Main() {
  return <TradePage />;
}
