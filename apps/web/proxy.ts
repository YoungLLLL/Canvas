import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { defaultLocale, isLocale } from "@/src/i18n/locales";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname !== "/") {
    return NextResponse.next();
  }

  const savedLocale = request.cookies.get("canvium-locale")?.value;
  const acceptedLanguages = request.headers.get("accept-language") ?? "";
  const browserLocale = acceptedLanguages
    .split(",")
    .map((entry) => entry.trim().split(";")[0]?.split("-")[0])
    .find(isLocale);
  const locale = isLocale(savedLocale) ? savedLocale : (browserLocale ?? defaultLocale);

  return NextResponse.redirect(new URL(`/${locale}`, request.url));
}

export const config = {
  matcher: "/",
};
