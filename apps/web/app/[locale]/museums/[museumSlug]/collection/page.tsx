import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CollectionMarquee } from "@/src/components/collection-marquee";
import { CollectionStateRestorer } from "@/src/components/collection-state";
import { DemoStyles } from "@/src/components/demo-styles";
import { isLocale } from "@/src/i18n/locales";
import { getArticCollection } from "@/src/lib/artic";
import { iiifImageUrl } from "@/src/lib/iiif";
import {
  collectionQuerySchema,
  collectionQueryString,
  museumSlugSchema,
} from "@/src/schemas/routes";

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
  searchParams,
}: PageProps<"/[locale]/museums/[museumSlug]/collection">) {
  const { locale, museumSlug } = await params;
  if (!isLocale(locale) || !museumSlugSchema.safeParse(museumSlug).success) notFound();
  const rawQuery = await searchParams;
  const query = collectionQuerySchema.safeParse(rawQuery);
  if (!query.success) redirect(`/${locale}/museums/${museumSlug}/collection`);

  const incoming = new URLSearchParams();
  for (const [key, value] of Object.entries(rawQuery)) {
    for (const item of Array.isArray(value) ? value : [value])
      if (item !== undefined) incoming.append(key, item);
  }
  const canonicalQuery = collectionQueryString(query.data);
  if (incoming.toString() !== canonicalQuery)
    redirect(
      `/${locale}/museums/${museumSlug}/collection${canonicalQuery ? `?${canonicalQuery}` : ""}`,
    );

  const catalog = await getArticCollection(query.data);
  const liveArtworks = catalog.items.flatMap((artwork) => {
    const image = artwork.images.preferred;
    if (!image) return [];
    return [
      {
        sourceId: artwork.sourceId,
        title: artwork.display.title,
        artist: artwork.display.artistDisplay,
        date: artwork.display.dateDisplay || "Date unknown",
        medium: artwork.display.mediumDisplay || "COLLECTION",
        origin: artwork.classification.departmentTitle || "CHICAGO",
        imageUrl: image.directUrl || iiifImageUrl(image, 843),
        ratio: image.width && image.height ? image.width / image.height : 1.2,
      },
    ];
  });
  const featuredArtworks = [
    {
      sourceId: "28560",
      title: locale === "zh" ? "卧室" : "The Bedroom",
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
      artist: "Vincent van Gogh",
      date: "1888",
      medium: "Oil on canvas",
      origin: "ARLES",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20The%20Poet%27s%20Garden%20-%201933.433%20-%20Art%20Institute%20of%20Chicago.jpg?width=1800",
      ratio: 92.1 / 73,
    },
  ];
  const artworks = query.data.q
    ? liveArtworks
    : [
        ...featuredArtworks,
        ...liveArtworks.filter(
          (artwork) => !featuredArtworks.some((featured) => featured.sourceId === artwork.sourceId),
        ),
      ];

  const pageHref = (page: number) => {
    const qs = collectionQueryString(query.data, page);
    return `/${locale}/museums/${museumSlug}/collection${qs ? `?${qs}` : ""}`;
  };

  return (
    <main
      className="view gallery-view active"
      aria-label={locale === "zh" ? "芝加哥数字画廊" : "Art Institute of Chicago digital gallery"}
    >
      <DemoStyles />
      <CollectionStateRestorer />
      <div className="museum-detail-hero">
        <div className="museum-title-block">
          <p>MUSEUM / 01</p>
          <h1>
            Art Institute
            <br />
            of Chicago
          </h1>
          <a href="https://www.artic.edu" target="_blank" rel="noreferrer">
            CHICAGO　·　UNITED STATES ↗
          </a>
        </div>
        <div className="museum-introduction">
          <p className="museum-introduction-en">
            The Art Institute of Chicago brings together art from across centuries and cultures,
            with celebrated strengths in Impressionism, Post-Impressionism, and modern American art.
          </p>
          <p className="museum-introduction-zh">
            芝加哥艺术博物馆汇集跨越多个世纪与文化的艺术收藏，尤以印象派、后印象派及美国现代艺术闻名。
          </p>
        </div>
      </div>

      {artworks.length ? (
        <CollectionMarquee artworks={artworks} locale={locale} />
      ) : (
        <p className="gallery-instruction">
          {locale === "zh" ? "馆藏图像暂时不可用" : "Collection images are temporarily unavailable"}
        </p>
      )}

      <form className="sr-only" action={`/${locale}/museums/${museumSlug}/collection`}>
        <label>
          {locale === "zh" ? "搜索馆藏" : "Search collection"}
          <input defaultValue={query.data.q} name="q" />
        </label>
        <button type="submit">{locale === "zh" ? "搜索" : "Search"}</button>
      </form>
      <nav className="sr-only" aria-label="Pagination">
        {query.data.page > 1 ? <Link href={pageHref(query.data.page - 1)}>Previous</Link> : null}
        {catalog.pageInfo.hasNextPage ? (
          <Link href={pageHref(query.data.page + 1)}>Next</Link>
        ) : null}
      </nav>
    </main>
  );
}
