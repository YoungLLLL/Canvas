import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CollectionInfiniteGrid } from "@/src/components/collection-infinite-grid";
import { CollectionMarquee, type MarqueeArtwork } from "@/src/components/collection-marquee";
import { EuropeanaSetupNotice } from "@/src/components/collection-source-controls";
import { CollectionStateRestorer } from "@/src/components/collection-state";
import { CollectionWheelReturn } from "@/src/components/collection-wheel-return";
import { DemoStyles } from "@/src/components/demo-styles";
import { isLocale } from "@/src/i18n/locales";
import { getCatalogCollection } from "@/src/lib/catalog";
import { sourceForMuseumSlug } from "@/src/lib/catalog-source";
import { resolveChineseArtworkTitle } from "@/src/lib/localized-artwork-title";
import { museumById } from "@/src/lib/museum-directory";
import { collectionQuerySchema, museumSlugSchema } from "@/src/schemas/routes";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/museums/[museumSlug]/collection">): Promise<Metadata> {
  const { locale, museumSlug } = await params;
  if (!isLocale(locale) || !museumSlugSchema.safeParse(museumSlug).success) return {};
  const source = sourceForMuseumSlug(museumSlug);
  const museum = source && source !== "europeana" ? museumById(source) : undefined;
  return {
    title:
      source === "europeana"
        ? locale === "zh"
          ? "全球多馆藏"
          : "Multi-museum Collection"
        : museum
          ? `${museum.name[locale]}${locale === "zh" ? "馆藏" : " Collection"}`
          : undefined,
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: PageProps<"/[locale]/museums/[museumSlug]/collection">) {
  const { locale, museumSlug } = await params;
  if (!isLocale(locale) || !museumSlugSchema.safeParse(museumSlug).success) notFound();
  const source = sourceForMuseumSlug(museumSlug);
  if (!source) notFound();
  const query = collectionQuerySchema.parse(await searchParams);
  const europeanaReady = Boolean(process.env.EUROPEANA_API_KEY?.trim());
  const selectedMuseum = source === "europeana" ? museumById(query.museum) : undefined;
  const officialMuseum = source !== "europeana" ? museumById(source) : undefined;
  const displayMuseum = selectedMuseum ?? officialMuseum;

  if (source === "europeana" && !europeanaReady) {
    return (
      <main className="view gallery-view collection-experience active">
        <DemoStyles />
        <EuropeanaSetupNotice locale={locale} />
      </main>
    );
  }

  const catalog = await getCatalogCollection(source, query);
  const featuredArtworks: MarqueeArtwork[] =
    source === "artic"
      ? [
          {
            source: "artic",
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
            source: "artic",
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
            source: "artic",
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
        ]
      : [];
  const featuredIds = new Set(featuredArtworks.map((artwork) => artwork.sourceId));
  for (const artwork of catalog.items) {
    if (featuredArtworks.length >= 8) break;
    const image = artwork.images.preferred;
    if (!image?.directUrl || featuredIds.has(artwork.sourceId)) continue;

    const englishTitle = artwork.display.localizedTitles.en ?? artwork.display.title;
    const resolvedChineseTitle = resolveChineseArtworkTitle(artwork);
    const chineseTitle = resolvedChineseTitle.hasChinese ? resolvedChineseTitle.text : undefined;
    featuredArtworks.push({
      source,
      sourceId: artwork.sourceId,
      title: locale === "zh" ? chineseTitle || englishTitle : englishTitle,
      secondaryTitle: locale === "zh" ? englishTitle : chineseTitle,
      artist: artwork.display.artistDisplay,
      date: artwork.display.dateDisplay ?? (locale === "zh" ? "年代待考" : "Date unknown"),
      medium: artwork.display.mediumDisplay ?? artwork.classification.artworkTypeTitle,
      origin: artwork.classification.departmentTitle ?? (source === "artic" ? "CHICAGO" : "EUROPE"),
      imageUrl: image.directUrl,
      ratio: image.width && image.height ? image.width / image.height : 1,
    });
    featuredIds.add(artwork.sourceId);
  }

  return (
    <main
      className="view gallery-view collection-experience active"
      aria-label={
        displayMuseum
          ? `${displayMuseum.name[locale]} ${locale === "zh" ? "数字馆藏" : "digital collection"}`
          : source === "artic"
            ? locale === "zh"
              ? "芝加哥数字画廊"
              : "Art Institute of Chicago digital gallery"
            : locale === "zh"
              ? "全球多馆藏"
              : "Multi-museum collection"
      }
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
              {displayMuseum ? (
                <>
                  {displayMuseum.name.en}
                  <span className="museum-title-zh">{displayMuseum.name.zh}</span>
                </>
              ) : (
                <>
                  Europeana
                  <br />
                  Collections
                  <span className="museum-title-zh">全球多馆藏</span>
                </>
              )}
            </h1>
            <a
              href={displayMuseum?.websiteUrl || "https://www.europeana.eu"}
              target="_blank"
              rel="noreferrer"
            >
              {displayMuseum
                ? `${displayMuseum.city.en.toUpperCase()}　·　${displayMuseum.country.en.toUpperCase()} ↗`
                : "MULTIPLE INSTITUTIONS　·　EUROPE ↗"}
            </a>
          </div>
          <div className="museum-introduction">
            <p className="museum-introduction-zh">
              {displayMuseum
                ? source === "europeana"
                  ? `${displayMuseum.description.zh} 下方作品按 Europeana 的馆藏提供机构字段精确筛选。`
                  : `${displayMuseum.description.zh} 下方仅展示馆方官方数据源中具有开放图片的平面绘画。`
                : "从欧洲多家博物馆与文化机构的数字馆藏中探索作品；使用上方搜索框可按艺术馆、艺术家或作品名称查找。"}
            </p>
            <p className="museum-introduction-en" lang="en">
              {displayMuseum
                ? source === "europeana"
                  ? `${displayMuseum.description.en} The works below are filtered by Europeana's contributing institution field.`
                  : `${displayMuseum.description.en} Only two-dimensional paintings with open images from the museum's official data source appear below.`
                : "Explore digitized works from museums and cultural institutions across Europe. Search above by museum, artist, or artwork."}
            </p>
          </div>
        </div>

        <CollectionMarquee artworks={featuredArtworks} locale={locale} />
      </section>

      <section
        aria-labelledby="full-collection-title"
        className="collection-catalog-section collection-catalog-flow"
        id="full-collection"
      >
        <h2 className="sr-only" id="full-collection-title">
          {locale === "zh" ? "馆藏作品" : "The collection"}
        </h2>
        <CollectionInfiniteGrid initialPage={catalog} locale={locale} source={source} />
      </section>
    </main>
  );
}
