import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChatPrototype } from "@/src/components/chat-prototype";
import { isLocale } from "@/src/i18n/locales";
import { getCatalogArtwork } from "@/src/lib/catalog";
import { museumSlugForSource, parseArtworkKey } from "@/src/lib/catalog-source";
import { buildDynamicPersonaOpening } from "@/src/lib/dynamic-persona-chat";
import { iiifImageUrl } from "@/src/lib/iiif";
import { resolveChineseArtworkTitle } from "@/src/lib/localized-artwork-title";
import { getReviewedPersonaOpeningForCatalogArtwork } from "@/src/lib/persona-openings";
import { getWikipediaArtistProfile } from "@/src/lib/wikipedia-artist-profile";
import { artworkKeySchema } from "@/src/schemas/routes";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/artworks/[artworkKey]">): Promise<Metadata> {
  const { locale, artworkKey } = await params;
  if (!isLocale(locale) || !artworkKeySchema.safeParse(artworkKey).success) return {};
  const parsedKey = parseArtworkKey(artworkKey);
  if (!parsedKey) return {};
  const artwork = await getCatalogArtwork(parsedKey.source, parsedKey.sourceId);
  return artwork ? { title: `${artwork.display.title} · ${artwork.display.artistDisplay}` } : {};
}

export default async function ArtworkPage({
  params,
}: PageProps<"/[locale]/artworks/[artworkKey]">) {
  const { locale, artworkKey } = await params;
  if (!isLocale(locale) || !artworkKeySchema.safeParse(artworkKey).success) notFound();
  const parsedKey = parseArtworkKey(artworkKey);
  if (!parsedKey) notFound();
  const { source, sourceId } = parsedKey;
  const artwork = await getCatalogArtwork(source, sourceId);
  if (
    !artwork ||
    !["image_displayable", "metadata_only_no_image", "metadata_only_rights"].includes(
      artwork.eligibility.status,
    )
  )
    notFound();
  const image = artwork.images.preferred;
  const reviewedOpening =
    source === "artic" ? getReviewedPersonaOpeningForCatalogArtwork(artwork) : undefined;
  const wikipediaProfile = reviewedOpening
    ? null
    : await getWikipediaArtistProfile(artwork.display.artistDisplay, artwork.artist?.name);
  const opening = reviewedOpening || buildDynamicPersonaOpening(artwork, wikipediaProfile);
  const knownTitle =
    locale === "zh" ? resolveChineseArtworkTitle(artwork).text : artwork.display.title;
  return (
    <ChatPrototype
      locale={locale}
      opening={opening}
      artworkId={source === "artic" ? artwork.id : undefined}
      collectionHref={`/${locale}/museums/${museumSlugForSource(source)}/collection`}
      artwork={{
        artistProfile: wikipediaProfile || undefined,
        sourceUrl: artwork.source.recordUrl,
        imageUrl: image ? image.directUrl2x || image.directUrl || iiifImageUrl(image, 1686) : null,
        title: knownTitle,
        artist: artwork.display.artistDisplay,
        year: artwork.display.dateDisplay || "",
        medium: artwork.display.mediumDisplay || "—",
        dimensions: artwork.display.dimensionsDisplay || "—",
        collection: artwork.source.label.toUpperCase(),
      }}
    />
  );
}
