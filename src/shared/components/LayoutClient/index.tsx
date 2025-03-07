"use client";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";

import Providers from "@/providers/dynamic-widget/providers";
import DevMenu from "@/shared/components/DevMenu/DevMenu";
import Footer from "@/shared/components/Footer/Footer";
import Header from "@/shared/components/Header/Header";
import PageWrapper from "@/shared/components/ui/PageWrapper/PageWrapper";

export const Client = ({
  children,
  isMobile,
  isMetaMask,
  messages,
}: {
  children: any;
  isMobile: boolean;
  isMetaMask: boolean;
  messages: any;
}) => {
  const isDev = process.env.NEXT_PUBLIC_NODE_ENV === "development";
  console.log("isMobile", isMobile);
  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider
        attribute="data-theme"
        defaultTheme="dark"
        enableSystem={false}
      >
        <PageWrapper isMobile={isMobile || false} isMetaMask={isMetaMask}>
          <Providers>
            <Header />
            {children}
            {isDev ? <DevMenu /> : null}
            <Footer />
          </Providers>
        </PageWrapper>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
};
