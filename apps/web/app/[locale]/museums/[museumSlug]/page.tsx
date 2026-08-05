import { notFound, redirect } from "next/navigation";

import { isLocale } from "@/src/i18n/locales";
import { museumSlugSchema } from "@/src/schemas/routes";

export default async function MuseumPage({ params }: PageProps<"/[locale]/museums/[museumSlug]">) {
  const { locale, museumSlug } = await params;
  if (!isLocale(locale) || !museumSlugSchema.safeParse(museumSlug).success) notFound();

  redirect(`/${locale}/museums/${museumSlug}/collection`);
}
