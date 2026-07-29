import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { VisualIndexLanding, type VisualIndexArtwork } from "@/src/components/visual-index-landing";
import { isLocale } from "@/src/i18n/locales";
import { getArticCollection } from "@/src/lib/artic";
import { iiifImageUrl } from "@/src/lib/iiif";
import { resolveChineseArtworkTitle } from "@/src/lib/localized-artwork-title";
import { collectionQuerySchema } from "@/src/schemas/routes";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/visual-index-demo">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: locale === "zh" ? "视觉馆藏索引 Demo" : "Visual collection index demo",
    robots: { index: false, follow: false },
  };
}

export default async function VisualIndexDemoPage({
  params,
}: PageProps<"/[locale]/visual-index-demo">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  let artworks: VisualIndexArtwork[] = [];
  let total = 0;
  try {
    const catalog = await getArticCollection(collectionQuerySchema.parse({ sort: "recent" }));
    total = catalog.pageInfo.totalEligible;
    artworks = catalog.items.flatMap((artwork) => {
      const image = artwork.images.preferred;
      if (!image) return [];
      const englishTitle = artwork.display.localizedTitles.en || artwork.display.title;
      const chineseTitle = resolveChineseArtworkTitle(artwork);
      const title = locale === "zh" ? chineseTitle.text : englishTitle;
      const secondaryTitle =
        locale === "zh"
          ? englishTitle !== title
            ? englishTitle
            : null
          : chineseTitle.hasChinese
            ? chineseTitle.text
            : null;
      return [
        {
          sourceId: artwork.sourceId,
          title,
          secondaryTitle,
          artist: artwork.display.artistDisplay,
          date: artwork.display.dateDisplay || (locale === "zh" ? "年代不详" : "Date unknown"),
          imageUrl: iiifImageUrl(image, 843),
          alt: image.altText || `${artwork.display.artistDisplay}, ${englishTitle}`,
        },
      ];
    });
  } catch (error) {
    console.error("Unable to build the visual artwork index demo", error);
  }

  return <VisualIndexLanding artworks={artworks} locale={locale} total={total} />;
}
