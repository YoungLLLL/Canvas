import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CollectionInfiniteGrid } from "@/src/components/collection-infinite-grid";
import { CollectionMarquee } from "@/src/components/collection-marquee";
import { CollectionStateRestorer } from "@/src/components/collection-state";
import { CollectionWheelReturn } from "@/src/components/collection-wheel-return";
import { DemoStyles } from "@/src/components/demo-styles";
import { isLocale } from "@/src/i18n/locales";
import { getArticCollection } from "@/src/lib/artic";
import { collectionQuerySchema, museumSlugSchema } from "@/src/schemas/routes";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/museums/[museumSlug]/collection">): Promise<Metadata> {
  const { locale, museumSlug } = await params;
  if (!isLocale(locale) || !museumSlugSchema.safeParse(museumSlug).success) return {};
  return {
    title: locale === "zh" ? "芝加哥艺术博物馆馆藏" : "Art Institute of Chicago Collection",
  };
}

export default async function CollectionPage({
  params,
}: PageProps<"/[locale]/museums/[museumSlug]/collection">) {
  const { locale, museumSlug } = await params;
  if (!isLocale(locale) || !museumSlugSchema.safeParse(museumSlug).success) notFound();

  const catalog = await getArticCollection(collectionQuerySchema.parse({}));
  const featuredArtworks = [
    {
      sourceId: "28560",
      title: locale === "zh" ? "卧室" : "The Bedroom",
      secondaryTitle: locale === "zh" ? "THE BEDROOM" : "卧室",
      artist: "Vincent van Gogh",
      date: "1889",
      medium: "Oil on canvas",
      origin: "ARLES",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20The%20Bedroom%20-%201926.417%20-%20Art%20Institute%20of%20Chicago.jpg?width=1800",
      ratio: 92.3 / 73.6,
    },
    {
      sourceId: "80607",
      title: locale === "zh" ? "自画像" : "Self-Portrait",
      secondaryTitle: locale === "zh" ? "SELF-PORTRAIT" : "自画像",
      artist: "Vincent van Gogh",
      date: "1887",
      medium: "Oil on artist's board",
      origin: "PARIS",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20Self-Portrait%20-%201954.326%20-%20Art%20Institute%20of%20Chicago.jpg?width=1400",
      ratio: 32.5 / 41,
    },
    {
      sourceId: "14586",
      title: locale === "zh" ? "诗人的花园" : "The Poet's Garden",
      secondaryTitle: locale === "zh" ? "THE POET'S GARDEN" : "诗人的花园",
      artist: "Vincent van Gogh",
      date: "1888",
      medium: "Oil on canvas",
      origin: "ARLES",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20The%20Poet%27s%20Garden%20-%201933.433%20-%20Art%20Institute%20of%20Chicago.jpg?width=1800",
      ratio: 92.1 / 73,
    },
  ];

  return (
    <main
      className="view gallery-view collection-experience active"
      aria-label={locale === "zh" ? "芝加哥数字画廊" : "Art Institute of Chicago digital gallery"}
    >
      <DemoStyles />
      <CollectionWheelReturn locale={locale} />
      <CollectionStateRestorer />

      <section className="collection-featured-screen" id="featured-collection">
        <div className="museum-detail-hero">
          <div className="museum-title-block">
            <p>
              <span>{locale === "zh" ? "精选馆藏" : "FEATURED COLLECTION"}</span>
              <small>{locale === "zh" ? "FEATURED COLLECTION" : "精选馆藏"}</small> / 01
            </p>
            <h1>
              Art Institute
              <br />
              of Chicago
              <span className="museum-title-zh">芝加哥艺术博物馆</span>
            </h1>
            <a href="https://www.artic.edu" target="_blank" rel="noreferrer">
              CHICAGO　·　UNITED STATES ↗
            </a>
          </div>
          <div className="museum-introduction">
            <p className="museum-introduction-zh">
              从芝加哥艺术博物馆跨越多个世纪与文化的收藏中，先观看一组精选作品；继续向下，即可浏览当前开放的数字馆藏。
            </p>
            <p className="museum-introduction-en" lang="en">
              Begin with a curated passage through the Art Institute of Chicago, then continue below
              to browse the digital collection currently available.
            </p>
          </div>
        </div>

        <CollectionMarquee artworks={featuredArtworks} locale={locale} />
        <a
          aria-label={locale === "zh" ? "浏览完整馆藏" : "Browse the full collection"}
          className="collection-scroll-cue"
          href="#full-collection"
        >
          <span>{locale === "zh" ? "浏览完整馆藏" : "Browse the full collection"}</span>
          <small>{locale === "zh" ? "BROWSE THE COLLECTION" : "浏览完整馆藏"}</small>
          <i aria-hidden="true">↓</i>
        </a>
      </section>

      <section className="collection-catalog-section" id="full-collection">
        <header className="collection-catalog-heading">
          <div>
            <p>
              <span>馆藏</span>
              <small>COLLECTION</small> / 02
            </p>
            <h2>
              <span>馆藏作品</span>
              <small>THE COLLECTION</small>
            </h2>
          </div>
          <div className="collection-catalog-summary">
            <strong>
              {catalog.pageInfo.totalEligible.toLocaleString(locale)}
              <small>
                <span>{locale === "zh" ? "件可访问作品" : "ACCESSIBLE WORKS"}</span>
                <i>{locale === "zh" ? "ACCESSIBLE WORKS" : "件可访问作品"}</i>
              </small>
            </strong>
            <a href="#featured-collection">
              <span>{locale === "zh" ? "返回精选" : "BACK TO FEATURED"}</span>
              <small>{locale === "zh" ? "BACK TO FEATURED" : "返回精选"}</small> ↑
            </a>
          </div>
        </header>

        <div className="collection-museum-introduction">
          <div>
            <span>芝加哥艺术博物馆</span>
            <strong>ART INSTITUTE OF CHICAGO</strong>
          </div>
          <div className="collection-museum-copy">
            <p>
              芝加哥艺术博物馆汇集跨越多个世纪与文化的艺术收藏，尤以印象派、后印象派及美国现代艺术闻名。这里展示的是目前具有明确公共领域与图片依据、可在线访问的绘画作品。
            </p>
            <p lang="en">
              The Art Institute of Chicago brings together art from across centuries and cultures,
              with celebrated strengths in Impressionism, Post-Impressionism, and modern American
              art. This digital selection presents paintings with clear public-domain and image
              evidence.
            </p>
          </div>
        </div>

        <CollectionInfiniteGrid initialPage={catalog} locale={locale} />
      </section>
    </main>
  );
}
