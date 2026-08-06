import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ParallaxLanding } from "@/src/components/parallax-landing";
import { isLocale } from "@/src/i18n/locales";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title:
      locale === "zh"
        ? "Canvium Gallery · 艺术与智能相遇"
        : "Canvium Gallery · Art meets intelligence",
    alternates: { canonical: `/${locale}`, languages: { en: "/en", zh: "/zh" } },
  };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <ParallaxLanding locale={locale} />;
}
