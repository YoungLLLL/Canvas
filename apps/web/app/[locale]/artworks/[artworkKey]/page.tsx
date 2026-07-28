import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChatPrototype } from "@/src/components/chat-prototype";
import { isLocale } from "@/src/i18n/locales";
import { getArticArtwork } from "@/src/lib/artic";
import { iiifImageUrl } from "@/src/lib/iiif";
import { getReviewedPersonaOpening } from "@/src/lib/persona-openings";
import { getWikipediaArtistProfile } from "@/src/lib/wikipedia-artist-profile";
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
  const wikipediaProfile = await getWikipediaArtistProfile(artwork.display.artistDisplay);
  const opening = getReviewedPersonaOpening(sourceId);
  const knownTitle =
    locale === "zh" && sourceId === "80607"
      ? "自画像"
      : locale === "zh" && sourceId === "28560"
        ? "卧室"
        : locale === "zh" && sourceId === "14586"
          ? "诗人的花园"
          : artwork.display.title;
  return (
    <ChatPrototype
      locale={locale}
      opening={opening}
      artworkId={`artic:${sourceId}`}
      artwork={{
        artistProfile: wikipediaProfile || undefined,
        sourceUrl: artwork.source.recordUrl,
        imageUrl: image ? image.directUrl || iiifImageUrl(image, 1686) : null,
        title: knownTitle,
        artist: artwork.display.artistDisplay,
        year: artwork.display.dateDisplay || "",
        medium: artwork.display.mediumDisplay || "—",
        dimensions: artwork.display.dimensionsDisplay || "—",
        collection:
          locale === "zh"
            ? "ART INSTITUTE OF CHICAGO · 芝加哥艺术博物馆"
            : "ART INSTITUTE OF CHICAGO",
      }}
    />
  );
}
