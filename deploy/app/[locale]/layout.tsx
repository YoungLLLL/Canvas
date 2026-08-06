import { notFound } from "next/navigation";

import { SiteShell } from "@/src/components/site-shell";
import { isLocale, locales } from "@/src/i18n/locales";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <SiteShell locale={locale}>{children}</SiteShell>;
}
