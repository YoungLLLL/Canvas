import { z } from "zod";

export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const museumSlugSchema = z.literal("art-institute-of-chicago");
export const artworkKeySchema = z.string().regex(/^[a-z][a-z0-9-]*-[a-z0-9]+$/);
export const maxAccessibleSearchPage = 834;

const queryValue = z.union([z.string(), z.array(z.string())]).optional();
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
const optionalYear = queryValue
  .transform((value) => first(value)?.trim() || undefined)
  .pipe(
    z
      .string()
      .regex(/^\d{4}$/)
      .transform(Number)
      .optional(),
  )
  .catch(undefined);

export const collectionQuerySchema = z
  .object({
    q: queryValue.transform(first).transform((value) => value?.trim() ?? ""),
    artist: queryValue.transform((value) =>
      (value === undefined ? [] : Array.isArray(value) ? value : [value]).filter((item) =>
        /^\d+$/.test(item),
      ),
    ),
    from: optionalYear,
    to: optionalYear,
    availability: queryValue
      .transform(first)
      .pipe(z.enum(["image", "metadata", "all"]).default("image"))
      .catch("image"),
    sort: queryValue
      .transform(first)
      .pipe(z.enum(["relevance", "recent", "title-asc", "date-asc", "date-desc"]).optional())
      .catch(undefined),
    page: queryValue
      .transform(first)
      .pipe(
        z.union([
          z
            .string()
            .regex(/^[1-9]\d*$/)
            .transform(Number)
            .refine((page) => page <= maxAccessibleSearchPage),
          z.undefined().transform(() => 1),
        ]),
      )
      .catch(1),
  })
  .transform((query, context) => {
    if (query.from !== undefined && query.to !== undefined && query.from > query.to) {
      context.addIssue({ code: "custom", path: ["from"], message: "from must not be after to" });
      return z.NEVER;
    }

    const defaultSort = query.q ? "relevance" : "recent";
    return {
      ...query,
      sort: !query.q && query.sort === "relevance" ? "recent" : (query.sort ?? defaultSort),
    };
  });

export type CollectionQuery = z.infer<typeof collectionQuerySchema>;

export function collectionQueryString(query: CollectionQuery, page = query.page) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  for (const artist of query.artist) params.append("artist", artist);
  if (query.from !== undefined) params.set("from", String(query.from));
  if (query.to !== undefined) params.set("to", String(query.to));
  if (query.availability !== "image") params.set("availability", query.availability);
  const defaultSort = query.q ? "relevance" : "recent";
  if (query.sort !== defaultSort) params.set("sort", query.sort);
  if (page > 1) params.set("page", String(page));
  return params.toString();
}
