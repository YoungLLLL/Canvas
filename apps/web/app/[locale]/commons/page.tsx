import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { isLocale } from "@/src/i18n/locales";
import { getWikimediaCollection } from "@/src/lib/wikimedia";

export const metadata: Metadata = {
  title: "Wikimedia Commons Open Collection — Canvium",
  description: "An evaluation of a cross-museum public-domain painting catalog.",
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CommonsPage({
  params,
  searchParams,
}: PageProps<"/[locale]/commons">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const raw = await searchParams;
  const q = first(raw.q)?.trim().slice(0, 100) ?? "";
  const requestedPage = Number(first(raw.page) ?? "1");
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const catalog = await getWikimediaCollection({ q, page, locale });
  const text =
    locale === "zh"
      ? {
          eyebrow: "统一开放馆藏试验",
          title: "Wikimedia Commons 公共领域绘画",
          summary:
            "Wikidata 提供跨博物馆的作品结构，Wikimedia Commons 提供图片和许可。本页只显示许可元数据明确为公共领域的图片。",
          search: "搜索作品或艺术家",
          submit: "搜索",
          empty: "没有找到许可明确的绘画",
          source: "在 Commons 查看来源与许可",
          previous: "上一页",
          next: "下一页",
          unknownCollection: "收藏机构未标注",
        }
      : {
          eyebrow: "Unified open-collection evaluation",
          title: "Public-domain paintings from Wikimedia Commons",
          summary:
            "Wikidata supplies cross-museum artwork structure while Wikimedia Commons supplies images and license metadata. This page only shows images explicitly marked public domain.",
          search: "Search artwork or artist",
          submit: "Search",
          empty: "No clearly licensed paintings found",
          source: "View source and license on Commons",
          previous: "Previous",
          next: "Next",
          unknownCollection: "Collection not recorded",
        };
  const href = (targetPage: number) => {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (targetPage > 1) query.set("page", String(targetPage));
    return `/${locale}/commons${query.size ? `?${query}` : ""}`;
  };

  return (
    <main className="collection-page">
      <section className="shell collection-hero">
        <p className="eyebrow">{text.eyebrow}</p>
        <h1>{text.title}</h1>
        <p>{text.summary}</p>
        <form className="collection-filter-form" action={`/${locale}/commons`}>
          <div className="collection-search">
            <input
              aria-label={text.search}
              defaultValue={q}
              name="q"
              placeholder={text.search}
              type="search"
            />
            <button type="submit">{text.submit} →</button>
          </div>
        </form>
        <div className="collection-scope">
          <span>Wikidata + Wikimedia Commons</span>
          <p>Public domain only · live API · page {page}</p>
          <span>{new Date(catalog.fetchedAt).toLocaleTimeString(locale)}</span>
        </div>
      </section>

      {catalog.items.length ? (
        <section className="shell artwork-grid" aria-label={text.title}>
          {catalog.items.map((artwork, index) => (
            <a
              className="artwork-card"
              href={artwork.sourceUrl}
              key={artwork.id}
              rel="noreferrer"
              target="_blank"
            >
              <figure style={{ aspectRatio: `${artwork.image.width} / ${artwork.image.height}` }}>
                {/* Wikimedia thumbnail URLs are already resized at the source. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={artwork.title}
                  decoding="async"
                  fetchPriority={index < 3 ? "high" : "auto"}
                  loading={index < 3 ? "eager" : "lazy"}
                  src={artwork.image.src}
                  srcSet={
                    artwork.image.src2x
                      ? `${artwork.image.src} ${artwork.image.width}w, ${artwork.image.src2x} ${artwork.image.width * 2}w`
                      : undefined
                  }
                />
                <span className="artwork-open">{text.source} →</span>
              </figure>
              <div>
                <h2>{artwork.title}</h2>
                <p>{artwork.artist}</p>
                <span>
                  {[
                    artwork.date,
                    artwork.collection ?? text.unknownCollection,
                    artwork.image.license,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </div>
            </a>
          ))}
        </section>
      ) : (
        <section className="shell collection-empty" aria-live="polite">
          <h2>{text.empty}</h2>
          <Link className="button button-primary" href={`/${locale}/commons`}>
            {locale === "zh" ? "清除搜索" : "Clear search"}
          </Link>
        </section>
      )}

      <nav className="shell pagination" aria-label="Pagination">
        {page > 1 ? <Link href={href(page - 1)}>← {text.previous}</Link> : <span />}
        <span>{String(page).padStart(2, "0")}</span>
        {catalog.hasNextPage ? <Link href={href(page + 1)}>{text.next} →</Link> : <span />}
      </nav>
    </main>
  );
}
