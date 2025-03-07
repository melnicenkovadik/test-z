import { Metadata } from "next";

import { PortfolioPageContainer } from "@/containers/portfolio";

export const metadata: Metadata = {
  metadataBase: new URL("https://app.zeuz.trade"),
  title: "Portfolio - ZEUZ",
  description: "Portfolio - ZEUZ",
  openGraph: {
    title: "Zeuz",
    description: "Portfolio - ZEUZ",
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
    description: "Portfolio - ZEUZ",
    images: ["/assets/banners/banner_zeus.png"],
  },
};

export default function PortfolioPage() {
  return <PortfolioPageContainer />;
}
