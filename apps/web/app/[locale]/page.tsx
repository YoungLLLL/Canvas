import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { copy } from "@/src/i18n/copy";
import { isLocale } from "@/src/i18n/locales";

const museumSlug = "art-institute-of-chicago";

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
  const text = copy[locale];

  return (
    <main className="shell page">
      <p className="eyebrow">{text.stage}</p>
      <h1 className="title">{text.homeTitle}</h1>
      <p className="lede">{text.homeLede}</p>
      <div className="actions">
        <Link className="button button-primary" href={`/${locale}/museums/${museumSlug}`}>
          {text.explore}
        </Link>
      </div>
      <section className="status-card" aria-labelledby="foundation-title">
        <h2 id="foundation-title">{text.foundation}</h2>
        <p>{text.foundationBody}</p>
      </section>
    </main>
  );
}
