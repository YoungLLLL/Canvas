import { z } from "zod";

export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const museumSlugSchema = z.literal("art-institute-of-chicago");
export const artworkKeySchema = z.string().regex(/^[a-z][a-z0-9-]*-[a-z0-9]+$/);

const queryValue = z.union([z.string(), z.array(z.string())]).optional();
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
const optionalYear = queryValue.transform(first).pipe(
  z
    .string()
    .regex(/^\d{4}$/)
    .transform(Number)
    .optional(),
);

export const collectionQuerySchema = z
  .object({
    q: queryValue.transform(first).transform((value) => value?.trim() ?? ""),
    artist: queryValue.transform((value) =>
      value === undefined ? [] : Array.isArray(value) ? value : [value],
    ),
    from: optionalYear,
    to: optionalYear,
    availability: queryValue
      .transform(first)
      .pipe(z.enum(["image", "metadata", "all"]).default("image")),
    sort: queryValue
      .transform(first)
      .pipe(z.enum(["relevance", "recent", "title-asc", "date-asc", "date-desc"]).optional()),
    page: queryValue.transform(first).pipe(
      z.union([
        z
          .string()
          .regex(/^[1-9]\d*$/)
          .transform(Number),
        z.undefined().transform(() => 1),
      ]),
    ),
  })
  .loose()
  .transform((query, context) => {
    if (query.from !== undefined && query.to !== undefined && query.from > query.to) {
      context.addIssue({ code: "custom", path: ["from"], message: "from must not be after to" });
      return z.NEVER;
    }

    return { ...query, sort: query.sort ?? (query.q ? "relevance" : "recent") };
  });

export type CollectionQuery = z.infer<typeof collectionQuerySchema>;
