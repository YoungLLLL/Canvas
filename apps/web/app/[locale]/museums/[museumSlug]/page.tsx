/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MuseumGlobe } from "@/src/components/museum-globe";
import { copy } from "@/src/i18n/copy";
import { isLocale } from "@/src/i18n/locales";
import { museumSlugSchema } from "@/src/schemas/routes";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/museums/[museumSlug]">): Promise<Metadata> {
  const { locale, museumSlug } = await params;
  if (!isLocale(locale) || !museumSlugSchema.safeParse(museumSlug).success) return {};
  return {
    title: locale === "zh" ? "芝加哥艺术博物馆" : "Art Institute of Chicago",
  };
}

export default async function MuseumPage({ params }: PageProps<"/[locale]/museums/[museumSlug]">) {
  const { locale, museumSlug } = await params;
  if (!isLocale(locale) || !museumSlugSchema.safeParse(museumSlug).success) notFound();
  const zh = locale === "zh";

  return (
    <main className="museum-page">
      <div aria-hidden="true" className="museum-library-title motion-reveal">
        CANVIUM Gallery
      </div>
      <section className="museum-summary motion-reveal" aria-labelledby="museum-name">
        <span className="eyebrow">TODAY&apos;S MUSEUM / 01</span>
        <h1 id="museum-name">{copy[locale].museumTitle}</h1>
        <p className="museum-official-name">Art Institute of Chicago</p>
        <a href="https://www.artic.edu" rel="noreferrer" target="_blank">
          CHICAGO · UNITED STATES ↗
        </a>
        <p className="museum-description">
          {zh
            ? "收藏横跨五千年艺术史，尤以印象派、后印象派及美国现代艺术闻名。进入一座连接真实馆藏记录的安静数字画廊。"
            : "Spanning five millennia of art, the museum is celebrated for Impressionist, Post-Impressionist, and modern American works. Enter a quiet digital gallery connected to trusted collection records."}
        </p>
        <div className="museum-feature">
          <figure>
            <img
              alt={zh ? "馆藏亮点：梵高自画像" : "Collection highlight: Van Gogh Self-Portrait"}
              src="https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20Self-Portrait%20-%201954.326%20-%20Art%20Institute%20of%20Chicago.jpg?width=500"
            />
          </figure>
          <div>
            <small>{zh ? "今日推荐" : "TODAY'S HIGHLIGHT"}</small>
            <strong>{zh ? "自画像" : "Self-Portrait"}</strong>
            <span>{zh ? "文森特·梵高 · 1887" : "Vincent van Gogh · 1887"}</span>
            <em>{zh ? "实时开放馆藏" : "LIVE OPEN COLLECTION"}</em>
          </div>
        </div>
        <Link className="museum-enter" href={`/${locale}/museums/${museumSlug}/collection`}>
          {zh ? "进入数字画廊" : "ENTER THE GALLERY"} <span>→</span>
        </Link>
        <a
          className="museum-official"
          href="https://www.artic.edu"
          rel="noreferrer"
          target="_blank"
        >
          {zh ? "官方网站" : "OFFICIAL WEBSITE"} ↗
        </a>
      </section>
      <section className="museum-globe-stage motion-reveal">
        <div className="museum-region-stats" aria-hidden="true">
          <strong>NORTH AMERICA</strong>
          <span>01　MUSEUM OPEN</span>
          <span>LIVE　COLLECTION</span>
        </div>
        <MuseumGlobe />
        <p className="museum-drag-cue">
          ↔　{zh ? "拖动旋转 · 方向键浏览" : "DRAG TO ROTATE · USE ARROW KEYS"}
        </p>
        <div className="museum-globe-legend" aria-hidden="true">
          <span>●　{zh ? "已开放" : "OPEN"}</span>
          <span>○　{zh ? "即将开放" : "COMING SOON"}</span>
          <span>◉　{zh ? "今日推荐" : "TODAY"}</span>
        </div>
      </section>
    </main>
  );
}
