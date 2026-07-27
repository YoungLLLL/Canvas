import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DemoArtworkDetail } from "@/src/components/demo-artwork-detail";
import { DemoStyles } from "@/src/components/demo-styles";
import { isLocale } from "@/src/i18n/locales";
import { getArticArtwork } from "@/src/lib/artic";
import { iiifImageUrl } from "@/src/lib/iiif";
import { artworkKeySchema } from "@/src/schemas/routes";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/artworks/[artworkKey]">): Promise<Metadata> {
  const { locale, artworkKey } = await params;
  if (!isLocale(locale) || !artworkKeySchema.safeParse(artworkKey).success) return {};
  const artwork = await getArticArtwork(artworkKey.replace("artic-", ""));
  return artwork ? { title: `${artwork.display.title} · ${artwork.display.artistDisplay}` } : {};
}

export default async function ArtworkPage({
  params,
}: PageProps<"/[locale]/artworks/[artworkKey]">) {
  const { locale, artworkKey } = await params;
  if (!isLocale(locale) || !artworkKeySchema.safeParse(artworkKey).success) notFound();
  const [source, sourceId] = artworkKey.split("-");
  if (source !== "artic" || !/^\d+$/.test(sourceId)) notFound();
  const artwork = await getArticArtwork(sourceId);
  if (
    !artwork ||
    !["image_displayable", "metadata_only_no_image"].includes(artwork.eligibility.status)
  )
    notFound();
  const image = artwork.images.preferred;
  const knownTitle =
    locale === "zh" && sourceId === "80607"
      ? "自画像"
      : locale === "zh" && sourceId === "28560"
        ? "卧室"
        : locale === "zh" && sourceId === "14586"
          ? "诗人的花园"
          : artwork.display.title;
  return (
    <>
      <DemoStyles />
      <DemoArtworkDetail
        locale={locale}
        imageUrl={image ? image.directUrl || iiifImageUrl(image, 1686) : null}
        ratio={image?.width && image.height ? image.width / image.height : 1.2}
        title={knownTitle}
        originalTitle={artwork.display.title}
        artist={artwork.display.artistDisplay}
        date={artwork.display.dateDisplay || ""}
        description={
          artwork.description?.text ||
          (locale === "zh"
            ? "馆方开放资料暂未提供完整作品说明。"
            : "The museum record does not currently include a full description.")
        }
        medium={artwork.display.mediumDisplay || "—"}
        dimensions={artwork.display.dimensionsDisplay || "—"}
        museumUrl={artwork.source.recordUrl}
        imageSourceUrl={image?.sourceUrl}
        licenseLabel={artwork.rights.image.licenseCode.replaceAll("-", " ")}
        licenseUrl={artwork.rights.image.licenseUrl || undefined}
        imageAttribution={artwork.rights.attribution}
        adaptationsAllowed={artwork.rights.image.usage?.adaptationsAllowed ?? false}
        commercialUseAllowed={artwork.rights.image.usage?.commercialUseAllowed ?? false}
      />
    </>
  );
}
