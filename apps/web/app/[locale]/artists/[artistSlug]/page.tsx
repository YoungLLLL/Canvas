import { notFound } from "next/navigation";

import { RoutePlaceholder } from "@/src/components/route-placeholder";
import { copy } from "@/src/i18n/copy";
import { isLocale } from "@/src/i18n/locales";
import { slugSchema } from "@/src/schemas/routes";

export default async function ArtistPage({ params }: PageProps<"/[locale]/artists/[artistSlug]">) {
  const { locale, artistSlug } = await params;
  if (!isLocale(locale) || !slugSchema.safeParse(artistSlug).success) notFound();

  return (
    <RoutePlaceholder
      locale={locale}
      eyebrow={`ARI · ${artistSlug}`}
      title={copy[locale].artistTitle}
    />
  );
}
