import { z } from "zod";

const isoDateTimeSchema = z.string().datetime({ offset: true });
const idSchema = z.string().min(1).max(240);

export const sourceRecordSchema = z.object({
  sourceId: idSchema,
  kind: z.enum([
    "museum_record",
    "primary_letter",
    "primary_document",
    "catalogue_raisonne",
    "scholarly_publication",
    "archive",
    "authority_record",
    "reference_work",
  ]),
  title: z.string().min(1),
  publisher: z.string().min(1).optional(),
  authors: z.array(z.string().min(1)).optional(),
  url: z.string().url().optional(),
  persistentId: z.string().min(1).optional(),
  language: z.string().min(2),
  publishedAt: z.string().optional(),
  accessedAt: isoDateTimeSchema,
  contentHash: z
    .string()
    .regex(/^[a-f0-9]{64}$/)
    .optional(),
  rights: z
    .object({
      code: z.string().min(1).optional(),
      notice: z.string().min(1).optional(),
      licenseUrl: z.string().url().optional(),
      allowedUses: z.array(z.enum(["quote", "summarize", "embed", "internal_retrieval"])),
    })
    .optional(),
  reliability: z.enum(["primary", "institutional", "scholarly", "reference"]),
  snapshotRef: z.string().min(1).optional(),
});

export const sourceRefSchema = z.object({
  sourceRefId: idSchema,
  sourceId: idSchema,
  locator: z.object({
    page: z.string().optional(),
    section: z.string().optional(),
    paragraph: z.string().optional(),
    letterId: z.string().optional(),
    timestamp: z.string().optional(),
    fragmentUrl: z.string().url().optional(),
  }),
  support: z.enum(["direct", "corroborating", "contextual", "contradicting"]),
  excerpt: z.string().optional(),
  excerptHash: z
    .string()
    .regex(/^[a-f0-9]{64}$/)
    .optional(),
});

export const visualEvidenceSchema = z.object({
  visualEvidenceId: idSchema,
  imageId: idSchema,
  region: z
    .object({
      x: z.number().min(0).max(1),
      y: z.number().min(0).max(1),
      width: z.number().positive().max(1),
      height: z.number().positive().max(1),
    })
    .optional(),
  basis: z.enum(["visible", "computed"]),
  observation: z.string().min(1),
  imageRevision: z.string().min(1),
});

export const claimSchema = z
  .object({
    claimId: idSchema,
    subjectId: idSchema,
    layer: z.enum(["fact", "interpretation", "speculation"]),
    text: z.string().min(1),
    predicate: z.string().min(1).optional(),
    value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]).optional(),
    temporalScope: z
      .object({
        start: z.string().optional(),
        end: z.string().optional(),
        display: z.string().optional(),
      })
      .optional(),
    sourceRefs: z.array(sourceRefSchema),
    visualEvidence: z.array(visualEvidenceSchema),
    confidence: z.enum(["high", "medium", "low"]),
    status: z.enum(["generated", "verified", "disputed", "rejected"]),
    qualification: z.string().min(1).optional(),
  })
  .superRefine((claim, context) => {
    const hasDirectSource = claim.sourceRefs.some((reference) => reference.support === "direct");
    const hasVisibleEvidence = claim.visualEvidence.some(
      (evidence) => evidence.basis === "visible",
    );
    if (claim.layer === "fact" && !hasDirectSource && !hasVisibleEvidence) {
      context.addIssue({
        code: "custom",
        path: ["sourceRefs"],
        message: "facts require direct or visible evidence",
      });
    }
    if (claim.layer === "speculation" && !claim.qualification) {
      context.addIssue({
        code: "custom",
        path: ["qualification"],
        message: "speculation requires qualification",
      });
    }
  });

export const sectionNameSchema = z.enum([
  "introduction",
  "observationPrompts",
  "recommendedQuestions",
  "tags",
  "relations",
  "palette",
  "accessibility",
  "facts",
  "interpretations",
  "speculations",
]);

export const sectionRunSchema = z.object({
  status: z.enum(["pending", "running", "succeeded", "failed", "blocked", "stale"]),
  attempt: z.number().int().nonnegative(),
  inputHash: z.string().min(1),
  outputHash: z.string().min(1).optional(),
  updatedAt: isoDateTimeSchema,
  error: z
    .object({ code: z.string().min(1), retryable: z.boolean(), message: z.string().min(1) })
    .optional(),
});

export const publicationSchema = z.object({
  status: z.enum(["draft", "needs_review", "published", "withdrawn"]),
  version: z.string().min(1),
  publishedAt: isoDateTimeSchema.optional(),
  publishedBy: z.string().min(1).optional(),
});

export const generationRecordSchema = z.object({
  provider: z.string().min(1),
  model: z.string().min(1),
  promptVersion: z.string().min(1),
  generatedAt: isoDateTimeSchema,
  inputHash: z.string().min(1),
});

export const personaVersionSchema = z.object({
  schemaVersion: z.literal("artist-persona/1.0.0"),
  personaId: idSchema,
  artistId: idSchema,
  locale: z.string().min(2),
  knowledgeVersion: z.string().min(1),
  promptVersion: z.string().min(1),
  evaluationVersion: z.string().min(1),
  publication: publicationSchema,
});

export type SourceRecord = z.infer<typeof sourceRecordSchema>;
export type SourceRef = z.infer<typeof sourceRefSchema>;
export type VisualEvidence = z.infer<typeof visualEvidenceSchema>;
export type Claim = z.infer<typeof claimSchema>;
export type SectionRun = z.infer<typeof sectionRunSchema>;
export type PersonaVersion = z.infer<typeof personaVersionSchema>;
