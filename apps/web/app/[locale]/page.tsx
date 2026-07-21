import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DemoLanding } from "@/src/components/demo-landing";
import { isLocale } from "@/src/i18n/locales";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: locale === "zh" ? "观看真实馆藏" : "Look closely at museum paintings",
    alternates: { canonical: `/${locale}`, languages: { en: "/en", zh: "/zh" } },
  };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <DemoLanding locale={locale} />;
}
