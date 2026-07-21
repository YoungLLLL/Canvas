import { z } from "zod";

const idSchema = z.string().min(1).max(200);
const isoDateTimeSchema = z.string().datetime({ offset: true });
const optionalUrlSchema = z.string().url().optional();

export const sourceSchema = z.object({
  id: idSchema,
  label: z.string().min(1),
  recordUrl: z.string().url(),
  apiUrl: optionalUrlSchema,
  termsUrl: optionalUrlSchema,
  updatedAt: isoDateTimeSchema.optional(),
  accessedAt: isoDateTimeSchema,
});

export const museumSchema = z.object({
  id: idSchema,
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(1),
  localizedNames: z.record(z.string(), z.string().min(1)).default({}),
  location: z.object({
    city: z.string().min(1),
    countryCode: z.string().length(2),
    latitude: z.number().finite().min(-90).max(90).optional(),
    longitude: z.number().finite().min(-180).max(180).optional(),
  }),
  websiteUrl: z.string().url(),
  collectionStatus: z.enum(["published", "coming_soon", "unavailable"]),
  source: sourceSchema,
});

export const artistSchema = z.object({
  id: idSchema,
  sourceId: idSchema,
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  name: z.string().min(1),
  display: z.string().min(1),
  birthYear: z.number().int().optional(),
  deathYear: z.number().int().optional(),
  personaStatus: z.enum(["unavailable", "draft", "review", "published"]),
});

export const imageAssetSchema = z.object({
  id: idSchema,
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  altText: z.string().min(1).optional(),
  lqip: z
    .string()
    .max(20_000)
    .regex(/^data:image\/(?:gif|jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/)
    .optional(),
  iiifBaseUrl: z.string().url().optional(),
  directUrl: z.string().url().optional(),
  directUrl2x: z.string().url().optional(),
  sourceUrl: z.string().url().optional(),
  zoomable: z.boolean(),
  maxZoomWindowSize: z.number().int().positive().nullable(),
  health: z.enum(["unknown", "ok", "low_resolution", "unavailable"]),
});

export const rightsSchema = z.object({
  work: z.object({
    status: z.enum(["public_domain", "copyrighted", "unknown"]),
    notice: z.string().min(1).nullable(),
  }),
  image: z.object({
    licenseCode: z.enum(["CC0-1.0", "PDM-1.0", "restricted", "unknown"]),
    licenseUrl: z.string().url().nullable(),
  }),
  metadata: z.object({
    defaultLicense: z.literal("CC0-1.0"),
    descriptionLicense: z.literal("CC-BY-4.0"),
  }),
  termsUrl: z.string().url(),
  attribution: z.string().min(1),
});

export const eligibilitySchema = z.object({
  status: z.enum([
    "image_displayable",
    "metadata_only_no_image",
    "metadata_only_rights",
    "quarantined_rights_conflict",
    "quarantined_type",
    "quarantined_invalid_record",
  ]),
  ruleVersion: z.string().min(1),
  checkedAt: isoDateTimeSchema,
  reasons: z.array(z.string().min(1)),
});

export const artworkSchema = z
  .object({
    id: z.string().regex(/^[a-z][a-z0-9-]*:[a-z0-9]+$/),
    sourceId: idSchema,
    museumId: idSchema,
    source: sourceSchema,
    display: z.object({
      title: z.string().min(1),
      altTitles: z.array(z.string().min(1)).default([]),
      artistDisplay: z.string().min(1),
      dateDisplay: z.string().min(1).optional(),
      mediumDisplay: z.string().min(1).optional(),
      dimensionsDisplay: z.string().min(1).optional(),
    }),
    artist: artistSchema.nullable(),
    date: z.object({ start: z.number().int().nullable(), end: z.number().int().nullable() }),
    classification: z.object({
      artworkTypeId: z.number().int().positive(),
      artworkTypeTitle: z.string().min(1),
      departmentTitle: z.string().min(1).optional(),
      classificationTitles: z.array(z.string().min(1)).default([]),
    }),
    images: z.object({
      preferred: imageAssetSchema.nullable(),
      alternates: z.array(imageAssetSchema),
    }),
    rights: rightsSchema,
    eligibility: eligibilitySchema,
    creditLine: z.string().min(1).optional(),
    mainReferenceNumber: z.string().min(1).optional(),
    description: z
      .object({
        html: z.string(),
        text: z.string(),
        sourceField: z.enum(["short_description", "description"]),
      })
      .optional(),
    revision: z.string().min(1),
  })
  .superRefine((artwork, context) => {
    if (artwork.eligibility.status === "image_displayable" && artwork.images.preferred === null) {
      context.addIssue({
        code: "custom",
        path: ["images", "preferred"],
        message: "image_displayable artworks require a preferred image",
      });
    }
    if (
      artwork.eligibility.status === "image_displayable" &&
      !["CC0-1.0", "PDM-1.0"].includes(artwork.rights.image.licenseCode)
    ) {
      context.addIssue({
        code: "custom",
        path: ["rights", "image", "licenseCode"],
        message: "displayable images require a CC0 or Public Domain Mark license",
      });
    }
    const images = [artwork.images.preferred, ...artwork.images.alternates].filter(
      (image) => image !== null,
    );
    for (const [index, image] of images.entries()) {
      if (!image.iiifBaseUrl && !image.directUrl) {
        context.addIssue({
          code: "custom",
          path: ["images", index === 0 ? "preferred" : "alternates"],
          message: "image assets require either an IIIF base URL or a direct URL",
        });
      }
    }
  });

export const catalogPageSchema = z.object({
  items: z.array(artworkSchema),
  pageInfo: z.object({
    totalEligible: z.number().int().nonnegative(),
    hasNextPage: z.boolean(),
    nextCursor: z.string().min(1).nullable(),
  }),
  query: z.object({
    q: z.string(),
    filters: z.record(z.string(), z.unknown()),
    sort: z.enum(["relevance", "recent", "title-asc", "date-asc", "date-desc"]),
  }),
  snapshotVersion: z.string().min(1),
  dataStatus: z
    .object({
      state: z.enum(["fresh", "stale"]),
      fetchedAt: isoDateTimeSchema,
    })
    .default({ state: "fresh", fetchedAt: "1970-01-01T00:00:00Z" }),
});

export type Source = z.infer<typeof sourceSchema>;
export type Museum = z.infer<typeof museumSchema>;
export type Artist = z.infer<typeof artistSchema>;
export type ImageAsset = z.infer<typeof imageAssetSchema>;
export type Rights = z.infer<typeof rightsSchema>;
export type Artwork = z.infer<typeof artworkSchema>;
export type CatalogPage = z.infer<typeof catalogPageSchema>;
