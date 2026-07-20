import { notFound } from "next/navigation";

import { RoutePlaceholder } from "@/src/components/route-placeholder";
import { copy } from "@/src/i18n/copy";
import { isLocale } from "@/src/i18n/locales";
import { artworkKeySchema } from "@/src/schemas/routes";

export default async function ArtworkPage({
  params,
}: PageProps<"/[locale]/artworks/[artworkKey]">) {
  const { locale, artworkKey } = await params;
  if (!isLocale(locale) || !artworkKeySchema.safeParse(artworkKey).success) notFound();

  return (
    <RoutePlaceholder
      locale={locale}
      eyebrow={`ART · ${artworkKey}`}
      title={copy[locale].artworkTitle}
    />
  );
}
