"use server";

import { cookies } from "next/headers";

import { Locale, defaultLocale } from "@/providers/i18n/config";

const LOCALE_NAME = "NEXT_LOCALE";

export async function getUserLocale() {
  const locale = (await cookies()).get(LOCALE_NAME);
  return locale?.value || defaultLocale;
}

export async function setUserLocale(locale: Locale) {
  const cookie = (await cookies()).set(LOCALE_NAME, locale);
  return cookie;
}
