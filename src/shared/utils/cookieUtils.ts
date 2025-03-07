import { parseCookies, setCookie as nookiesSetCookie } from "nookies";

export const getCookie = (name: string): string | null => {
  const cookies = parseCookies();
  return cookies[name] || null;
};

export const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  nookiesSetCookie(null, name, value, {
    path: "/",
    expires: new Date(expires),
  });
};
