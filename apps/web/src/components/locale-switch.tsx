"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import type { Locale } from "@/src/i18n/locales";

export function LocaleSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const alternate = locale === "en" ? "zh" : "en";
  const parts = pathname.split("/");
  parts[1] = alternate;
  const query = searchParams.toString();
  return (
    <Link href={`${parts.join("/")}${query ? `?${query}` : ""}`}>{alternate.toUpperCase()}</Link>
  );
}
