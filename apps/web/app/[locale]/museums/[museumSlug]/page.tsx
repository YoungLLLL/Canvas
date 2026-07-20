import { notFound } from "next/navigation";

import { RoutePlaceholder } from "@/src/components/route-placeholder";
import { copy } from "@/src/i18n/copy";
import { isLocale } from "@/src/i18n/locales";
import { museumSlugSchema } from "@/src/schemas/routes";

export default async function MuseumPage({ params }: PageProps<"/[locale]/museums/[museumSlug]">) {
  const { locale, museumSlug } = await params;
  if (!isLocale(locale) || !museumSlugSchema.safeParse(museumSlug).success) notFound();

  return (
    <RoutePlaceholder
      locale={locale}
      eyebrow="MUS · Museum"
      title={copy[locale].museumTitle}
      detail={copy[locale].museumLede}
    />
  );
}
