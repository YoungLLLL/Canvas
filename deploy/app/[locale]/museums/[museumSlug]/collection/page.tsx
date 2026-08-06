import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FloatingCollectionDemo } from "@/src/components/floating-collection-demo";
import { CollectionRouteReady } from "@/src/components/collection-route-ready";
import { isLocale } from "@/src/i18n/locales";
import { getCatalogCollection } from "@/src/lib/catalog";
import { sourceForMuseumSlug } from "@/src/lib/catalog-source";
import { museumById } from "@/src/lib/museum-directory";
import { collectionQuerySchema, museumSlugSchema } from "@/src/schemas/routes";

const INITIAL_ARTIC_PAGE_COUNT = 6;
const ARTIC_PRELOAD_BATCH_SIZE = 3;

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/museums/[museumSlug]/collection">): Promise<Metadata> {
  const { locale, museumSlug } = await params;
  if (!isLocale(locale) || !museumSlugSchema.safeParse(museumSlug).success) return {};
  const source = sourceForMuseumSlug(museumSlug);
  const museum = source && source !== "europeana" ? museumById(source) : undefined;

  return {
    title: museum
      ? `${museum.name[locale]}${locale === "zh" ? "馆藏" : " Collection"}`
      : locale === "zh"
        ? "Canvium 馆藏"
        : "Canvium Collection",
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: PageProps<"/[locale]/museums/[museumSlug]/collection">) {
  const { locale, museumSlug } = await params;
  if (!isLocale(locale) || !museumSlugSchema.safeParse(museumSlug).success) notFound();

  const source = sourceForMuseumSlug(museumSlug);
  if (!source) notFound();

  const query = collectionQuerySchema.parse(await searchParams);
  const initialPages = [];

  if (source === "artic") {
    const results: PromiseSettledResult<{
      page: Awaited<ReturnType<typeof getCatalogCollection>>;
      pageNumber: number;
    }>[] = [];
    for (
      let firstPageNumber = 1;
      firstPageNumber <= INITIAL_ARTIC_PAGE_COUNT;
      firstPageNumber += ARTIC_PRELOAD_BATCH_SIZE
    ) {
      const batch = await Promise.allSettled(
        Array.from(
          {
            length: Math.min(
              ARTIC_PRELOAD_BATCH_SIZE,
              INITIAL_ARTIC_PAGE_COUNT - firstPageNumber + 1,
            ),
          },
          (_, index) => firstPageNumber + index,
        ).map(async (pageNumber) => ({
          page: await getCatalogCollection(source, { ...query, page: pageNumber }, undefined, {
            enrichArticImages: false,
          }),
          pageNumber,
        })),
      );
      results.push(...batch);
    }
    const failures = results.filter(
      (result): result is PromiseRejectedResult => result.status === "rejected",
    );
    initialPages.push(
      ...results.flatMap((result) => (result.status === "fulfilled" ? [result.value] : [])),
    );
    failures.forEach(({ reason }) =>
      console.error(
        "Unable to preload a collection page",
        reason instanceof Error ? `${reason.name}: ${reason.message}` : String(reason),
      ),
    );
    if (!initialPages.length && failures[0]) throw failures[0].reason;
  } else {
    let cursor: string | undefined;
    for (let pageNumber = 1; pageNumber <= 14; pageNumber += 1) {
      try {
        const page = await getCatalogCollection(source, query, cursor);
        initialPages.push({ page, pageNumber });
        cursor = page.pageInfo.nextCursor ?? undefined;
        if (!cursor) break;
      } catch (error) {
        if (!initialPages.length) throw error;
        console.error("Unable to preload another collection page", error);
        break;
      }
    }
  }

  return (
    <>
      <CollectionRouteReady locale={locale} />
      <FloatingCollectionDemo initialPages={initialPages} locale={locale} source={source} />
    </>
  );
}
