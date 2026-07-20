import { notFound } from "next/navigation";

import { RoutePlaceholder } from "@/src/components/route-placeholder";
import { copy } from "@/src/i18n/copy";
import { isLocale } from "@/src/i18n/locales";
import { collectionQuerySchema, museumSlugSchema } from "@/src/schemas/routes";

export default async function CollectionPage({
  params,
  searchParams,
}: PageProps<"/[locale]/museums/[museumSlug]/collection">) {
  const { locale, museumSlug } = await params;
  if (!isLocale(locale) || !museumSlugSchema.safeParse(museumSlug).success) notFound();

  const query = collectionQuerySchema.safeParse(await searchParams);
  const detail = query.success
    ? `${copy[locale].placeholder} · page ${query.data.page}`
    : locale === "zh"
      ? "查询参数无效，请清除筛选后重试。"
      : "The collection query is invalid. Clear the filters and try again.";

  return (
    <RoutePlaceholder
      locale={locale}
      eyebrow="COL · Collection"
      title={copy[locale].collectionTitle}
      detail={detail}
    />
  );
}
