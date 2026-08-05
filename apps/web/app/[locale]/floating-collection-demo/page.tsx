import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FloatingCollectionDemo } from "@/src/components/floating-collection-demo";
import { isLocale } from "@/src/i18n/locales";
import { getCatalogCollection } from "@/src/lib/catalog";
import { collectionQuerySchema } from "@/src/schemas/routes";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Floating Collection Demo",
};

export default async function FloatingCollectionDemoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const initialPages = await Promise.all(
    [1, 2, 3].map(async (pageNumber) => ({
      page: await getCatalogCollection(
        "artic",
        collectionQuerySchema.parse({ page: String(pageNumber) }),
      ),
      pageNumber,
    })),
  );

  return <FloatingCollectionDemo initialPages={initialPages} locale={locale} />;
}
