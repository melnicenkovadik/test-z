import localFont from "next/font/local";
import { headers } from "next/headers";
import { getLocale, getMessages } from "next-intl/server";

import "../shared/styles/globals.css";
import { Client } from "@/shared/components/LayoutClient";

if (process.env.NODE_ENV === "production") {
  console.log = () => {};
}

const satoshi = localFont({
  src: [
    // Light
    {
      path: "../../public/fonts/Satoshi-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/Satoshi-LightItalic.woff2",
      weight: "300",
      style: "italic",
    },
    // Regular
    {
      path: "../../public/fonts/Satoshi-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Satoshi-Italic.woff2",
      weight: "400",
      style: "italic",
    },
    // Medium
    {
      path: "../../public/fonts/Satoshi-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Satoshi-MediumItalic.woff2",
      weight: "500",
      style: "italic",
    },
    // Bold
    {
      path: "../../public/fonts/Satoshi-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Satoshi-BoldItalic.woff2",
      weight: "700",
      style: "italic",
    },
    // Black
    {
      path: "../../public/fonts/Satoshi-Black.woff2",
      weight: "900",
      style: "normal",
    },
    {
      path: "../../public/fonts/Satoshi-BlackItalic.woff2",
      weight: "900",
      style: "italic",
    },
    {
      path: "../../public/fonts/Satoshi-BlackItalic.woff2",
      weight: "900",
      style: "italic",
    },
  ],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://app.zeuz.trade"),
  title: "zeuz.trade",
  description:
    "ZEUZ Perps DEX - intuitive and user-centric trading with 0 gas & infinite liquidity.",
  openGraph: {
    title: "zeuz.trade",
    description:
      "ZEUZ Perps DEX - intuitive and user-centric trading with 0 gas & infinite liquidity.",
    images: [
      {
        // Можно использовать относительный путь, который затем будет разрешён относительно metadataBase:
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Изображение для Open Graph",
      },
    ],
    url: "https://zeuz.trade",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "zeuz.trade",
    description:
      "ZEUZ Perps DEX - intuitive and user-centric trading with 0 gas & infinite liquidity.",
    images: [
      {
        // Аналогично, относительный путь будет преобразован в абсолютный
        url: "/twitter-image.jpg",
        alt: "Изображение для Twitter",
      },
    ],
  },
};

export default async function RootLayout({ children }: { children: any }) {
  const locale = (await getLocale()) || "en";
  console.log("locale", locale);
  const messages = (await getMessages()) || {};
  console.log("messages", messages);
  const userAgent = (await headers())?.get("user-agent")?.toLowerCase() || "";
  const isMobile =
    /mobile|android|ios|iphone|IPhone|ipad|ipod|blackberry|windows phone/i.test(
      userAgent,
    );
  const isMetaMask = userAgent?.includes("MetaMask");
  return (
    <html suppressHydrationWarning lang={locale} className={satoshi.className}>
      <body suppressHydrationWarning>
        <Client
          messages={messages}
          locale={locale}
          isMetaMask={isMetaMask}
          isMobile={isMobile}
        >
          {children}
        </Client>
      </body>
    </html>
  );
}
