/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { MuseumGlobe } from "@/src/components/museum-globe";
import { copy } from "@/src/i18n/copy";
import { isLocale } from "@/src/i18n/locales";
import { museumSlugSchema } from "@/src/schemas/routes";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/museums/[museumSlug]">): Promise<Metadata> {
  const { locale, museumSlug } = await params;
  if (!isLocale(locale) || !museumSlugSchema.safeParse(museumSlug).success) return {};
  if (museumSlug === "europeana") {
    return { title: locale === "zh" ? "全球多馆藏" : "Multi-museum Collection" };
  }
  return {
    title: locale === "zh" ? "芝加哥艺术博物馆" : "Art Institute of Chicago",
  };
}

export default async function MuseumPage({ params }: PageProps<"/[locale]/museums/[museumSlug]">) {
  const { locale, museumSlug } = await params;
  if (!isLocale(locale) || !museumSlugSchema.safeParse(museumSlug).success) notFound();
  if (museumSlug === "europeana") redirect(`/${locale}/museums/europeana/collection`);
  const zh = locale === "zh";

  return (
    <main className="museum-page">
      <div className="museum-masthead">
        <div aria-hidden="true" className="museum-library-title">
          CANVIUM Gallery
        </div>
        <p aria-hidden="true" className="museum-page-index">
          <span>INSTITUTION INDEX</span>
          <b>01</b>
          <small>/ 01</small>
        </p>
      </div>
      <section className="museum-summary" aria-labelledby="museum-name">
        <span className="eyebrow">今日博物馆 / TODAY&apos;S MUSEUM · 01</span>
        <div className="museum-name-lockup">
          <h1 id="museum-name">{copy[locale].museumTitle}</h1>
          <p className="museum-official-name">
            {zh ? "Art Institute of Chicago" : "芝加哥艺术博物馆"}
          </p>
          <a href="https://www.artic.edu" rel="noreferrer" target="_blank">
            CHICAGO · UNITED STATES ↗
          </a>
        </div>
        <div className="museum-description">
          <p>
            {zh
              ? "收藏横跨五千年艺术史，尤以印象派、后印象派及美国现代艺术闻名。进入一座连接真实馆藏记录的安静数字画廊。"
              : "Spanning five millennia of art, the museum is celebrated for Impressionist, Post-Impressionist, and modern American works. Enter a quiet digital gallery connected to trusted collection records."}
          </p>
          <p className="museum-description-secondary">
            {zh
              ? "Spanning five millennia of art, with celebrated Impressionist, Post-Impressionist, and modern American collections."
              : "收藏横跨五千年艺术史，尤以印象派、后印象派及美国现代艺术闻名。"}
          </p>
        </div>
        <div className="museum-feature">
          <figure>
            <span aria-hidden="true">01</span>
            <img
              alt={zh ? "馆藏亮点：梵高自画像" : "Collection highlight: Van Gogh Self-Portrait"}
              src="https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20Self-Portrait%20-%201954.326%20-%20Art%20Institute%20of%20Chicago.jpg?width=500"
            />
          </figure>
          <div>
            <small>今日推荐 / TODAY&apos;S HIGHLIGHT</small>
            <strong>{zh ? "自画像 / SELF-PORTRAIT" : "SELF-PORTRAIT / 自画像"}</strong>
            <span>
              {zh
                ? "文森特·梵高 / VINCENT VAN GOGH · 1887"
                : "VINCENT VAN GOGH / 文森特·梵高 · 1887"}
            </span>
            <em>实时开放馆藏 / LIVE OPEN COLLECTION</em>
          </div>
        </div>
        <div className="museum-actions">
          <Link className="museum-enter" href={`/${locale}/museums/${museumSlug}/collection`}>
            {zh ? "进入数字画廊 / ENTER THE GALLERY" : "ENTER THE GALLERY / 进入数字画廊"}{" "}
            <span>→</span>
          </Link>
          <a
            className="museum-official"
            href="https://www.artic.edu"
            rel="noreferrer"
            target="_blank"
          >
            {zh ? "官方网站 / OFFICIAL WEBSITE" : "OFFICIAL WEBSITE / 官方网站"} ↗
          </a>
        </div>
      </section>
      <section className="museum-globe-stage">
        <p className="museum-globe-kicker" aria-hidden="true">
          <span>FEATURED LOCATION</span>
          <b>41.8796° N</b>
          <b>87.6237° W</b>
        </p>
        <div className="museum-region-stats" aria-hidden="true">
          <strong>NORTH AMERICA</strong>
          <span>01　MUSEUM OPEN</span>
          <span>LIVE　COLLECTION</span>
        </div>
        <MuseumGlobe locale={locale} />
        <p className="museum-drag-cue">
          ↔　拖动旋转 / DRAG TO ROTATE · 方向键浏览 / USE ARROW KEYS
        </p>
        <div className="museum-globe-legend" aria-hidden="true">
          <span>●　已开放 / OPEN</span>
          <span>○　即将开放 / COMING SOON</span>
          <span>◉　今日推荐 / TODAY</span>
        </div>
      </section>
    </main>
  );
}
