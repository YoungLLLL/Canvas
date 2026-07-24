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
  "dialogueCues",
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

export const reviewRecordSchema = z.object({
  status: z.enum(["pending", "passed", "blocked"]),
  evaluationVersion: z.string().min(1),
  reviewedAt: isoDateTimeSchema.optional(),
  reviewedBy: z.string().min(1).optional(),
  issues: z
    .array(
      z.object({
        code: z.string().min(1),
        severity: z.enum(["warning", "error"]),
        message: z.string().min(1),
        path: z.array(z.union([z.string(), z.number()])),
      }),
    )
    .default([]),
});

export const introductionSchema = z
  .object({
    text: z.string().min(1).max(1_600),
    claimIds: z.array(idSchema).min(1),
  })
  .strict();

export const artworkTagSchema = z
  .object({
    tagId: idSchema,
    label: z.string().min(1).max(80),
    vocabulary: z.string().min(1),
    confidence: z.enum(["high", "medium", "low"]),
    claimIds: z.array(idSchema),
    visualEvidenceIds: z.array(idSchema),
  })
  .strict();

export const artworkRelationSchema = z
  .object({
    relationId: idSchema,
    targetArtworkId: idSchema,
    kind: z.enum(["visual", "subject", "technique", "period", "context"]),
    explanation: z.string().min(1).max(800),
    claimIds: z.array(idSchema).min(1),
  })
  .strict();

export const paletteColorSchema = z
  .object({
    hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    proportion: z.number().min(0).max(1),
    luminance: z.number().min(0).max(1),
    label: z.string().min(1).max(80),
  })
  .strict();

export const accessibilityDescriptionSchema = z
  .object({
    short: z.string().min(1).max(500),
    long: z.string().min(1).max(2_000),
    claimIds: z.array(idSchema),
    visualEvidenceIds: z.array(idSchema).min(1),
  })
  .strict();

/**
 * Internal conversational material. Dialogue cues are never rendered as
 * suggestions or copied into a reply verbatim. The runtime dialogue planner
 * may select one only when it naturally follows the user's current topic.
 */
export const dialogueCueSchema = z
  .object({
    cueId: idSchema,
    artworkId: idSchema,
    locale: z.string().min(2),
    topic: z.enum([
      "composition",
      "color",
      "light",
      "space",
      "subject",
      "technique",
      "material",
      "context",
      "comparison",
    ]),
    triggerIntents: z.array(z.string().min(1).max(120)).min(1).max(12),
    claimIds: z.array(idSchema).min(1),
    visualEvidenceIds: z.array(idSchema).max(12),
    compatiblePersonaIds: z.array(idSchema).max(20).default([]),
    move: z.enum(["mention", "compare", "invite_observation", "ask_follow_up"]),
    transitionHint: z.string().min(1).max(320),
    delivery: z
      .object({
        minimumTurn: z.number().int().min(1).default(1),
        cooldownTurns: z.number().int().min(0).max(20).default(3),
        maxUsesPerConversation: z.number().int().min(1).max(3).default(1),
        requiresUserInitiation: z.boolean().default(false),
      })
      .strict(),
    confidence: z.enum(["high", "medium"]),
    status: z.enum(["generated", "verified", "rejected"]),
  })
  .strict();

export const artworkKnowledgePackageSchema = z
  .object({
    schemaVersion: z.literal("artwork-knowledge/2.0.0"),
    packageId: idSchema,
    artworkId: idSchema,
    artworkRevision: z.string().min(1),
    imageRevision: z.string().min(1).nullable(),
    locale: z.string().min(2),
    sources: z.array(sourceRecordSchema),
    claims: z.array(claimSchema),
    content: z
      .object({
        introduction: introductionSchema.nullable(),
        tags: z.array(artworkTagSchema),
        relations: z.array(artworkRelationSchema),
        palette: z.array(paletteColorSchema).max(12),
        accessibility: accessibilityDescriptionSchema.nullable(),
      })
      .strict(),
    dialogueCues: z.array(dialogueCueSchema),
    sectionRuns: z.partialRecord(sectionNameSchema, sectionRunSchema),
    generation: generationRecordSchema,
    review: reviewRecordSchema,
    publication: publicationSchema,
  })
  .strict()
  .superRefine((knowledge, context) => {
    const claimIds = new Set(knowledge.claims.map((claim) => claim.claimId));
    const visualEvidenceIds = new Set(
      knowledge.claims.flatMap((claim) =>
        claim.visualEvidence.map((evidence) => evidence.visualEvidenceId),
      ),
    );
    const sourceIds = new Set(knowledge.sources.map((source) => source.sourceId));

    const requireKnownClaims = (ids: string[], path: (string | number)[]) => {
      for (const [index, claimId] of ids.entries()) {
        if (!claimIds.has(claimId)) {
          context.addIssue({
            code: "custom",
            path: [...path, index],
            message: `unknown claimId: ${claimId}`,
          });
        }
      }
    };
    const requireKnownVisualEvidence = (ids: string[], path: (string | number)[]) => {
      for (const [index, visualEvidenceId] of ids.entries()) {
        if (!visualEvidenceIds.has(visualEvidenceId)) {
          context.addIssue({
            code: "custom",
            path: [...path, index],
            message: `unknown visualEvidenceId: ${visualEvidenceId}`,
          });
        }
      }
    };

    for (const [claimIndex, claim] of knowledge.claims.entries()) {
      if (claim.subjectId !== knowledge.artworkId) {
        context.addIssue({
          code: "custom",
          path: ["claims", claimIndex, "subjectId"],
          message: "claim subjectId must match artworkId",
        });
      }
      for (const [referenceIndex, reference] of claim.sourceRefs.entries()) {
        if (!sourceIds.has(reference.sourceId)) {
          context.addIssue({
            code: "custom",
            path: ["claims", claimIndex, "sourceRefs", referenceIndex, "sourceId"],
            message: `unknown sourceId: ${reference.sourceId}`,
          });
        }
      }
    }

    if (knowledge.content.introduction) {
      requireKnownClaims(knowledge.content.introduction.claimIds, [
        "content",
        "introduction",
        "claimIds",
      ]);
    }
    knowledge.content.tags.forEach((tag, index) => {
      requireKnownClaims(tag.claimIds, ["content", "tags", index, "claimIds"]);
      requireKnownVisualEvidence(tag.visualEvidenceIds, [
        "content",
        "tags",
        index,
        "visualEvidenceIds",
      ]);
    });
    knowledge.content.relations.forEach((relation, index) => {
      requireKnownClaims(relation.claimIds, ["content", "relations", index, "claimIds"]);
    });
    if (knowledge.content.accessibility) {
      requireKnownClaims(knowledge.content.accessibility.claimIds, [
        "content",
        "accessibility",
        "claimIds",
      ]);
      requireKnownVisualEvidence(knowledge.content.accessibility.visualEvidenceIds, [
        "content",
        "accessibility",
        "visualEvidenceIds",
      ]);
    }
    knowledge.dialogueCues.forEach((cue, index) => {
      if (cue.artworkId !== knowledge.artworkId) {
        context.addIssue({
          code: "custom",
          path: ["dialogueCues", index, "artworkId"],
          message: "dialogue cue artworkId must match package artworkId",
        });
      }
      requireKnownClaims(cue.claimIds, ["dialogueCues", index, "claimIds"]);
      requireKnownVisualEvidence(cue.visualEvidenceIds, [
        "dialogueCues",
        index,
        "visualEvidenceIds",
      ]);
    });
    if (knowledge.publication.status === "published" && knowledge.review.status !== "passed") {
      context.addIssue({
        code: "custom",
        path: ["publication", "status"],
        message: "published knowledge requires a passed review",
      });
    }
  });

export const personaTraitSchema = z
  .object({
    traitId: idSchema,
    label: z.string().min(1).max(120),
    realization: z.array(z.string().min(1).max(320)).min(1).max(12),
    avoid: z.array(z.string().min(1).max(320)).max(12),
    basis: z.enum(["documented", "inferred", "dramaturgical"]),
    confidence: z.enum(["high", "medium", "low"]),
    claimIds: z.array(idSchema),
    rationale: z.string().min(1).max(800),
    strength: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  })
  .strict()
  .superRefine((trait, context) => {
    if (trait.basis === "documented" && trait.claimIds.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["claimIds"],
        message: "documented persona traits require supporting claims",
      });
    }
    if (trait.basis === "dramaturgical" && trait.confidence === "high") {
      context.addIssue({
        code: "custom",
        path: ["confidence"],
        message: "dramaturgical choices cannot claim high historical confidence",
      });
    }
  });

export const voiceProfileSchema = z
  .object({
    traits: z.array(personaTraitSchema).min(1),
    register: z
      .object({
        formality: z.enum(["low", "medium", "high"]),
        sentenceLength: z.enum(["short", "mixed"]),
        metaphorDensity: z.enum(["none", "low", "medium"]),
        emotionalIntensity: z.enum(["restrained", "moderate"]),
      })
      .strict(),
    firstPerson: z.literal(true),
    languageNotes: z.array(z.string().min(1).max(500)),
    forbiddenTropes: z.array(z.string().min(1).max(240)),
  })
  .strict();

export const personaOpeningTemplateSchema = z
  .object({
    templateId: idSchema,
    text: z.string().min(1).max(800),
    claimIds: z.array(idSchema).min(1),
  })
  .strict();

export const personaArtworkContextSchema = z
  .object({
    artworkId: idSchema,
    activePeriod: z
      .object({
        start: z.string().optional(),
        end: z.string().optional(),
      })
      .strict(),
    claimIds: z.array(idSchema).min(1),
    allowedTopics: z.array(z.string().min(1).max(240)).min(1),
    blockedInferences: z.array(z.string().min(1).max(320)).min(1),
    openingTemplates: z.array(personaOpeningTemplateSchema).min(1),
  })
  .strict();

export const artistPersonaPackageSchema = z
  .object({
    schemaVersion: z.literal("artist-persona/2.0.0"),
    personaId: idSchema,
    artistId: idSchema,
    locale: z.string().min(2),
    identity: z
      .object({
        displayName: z.string().min(1),
        originalNames: z.array(z.string().min(1)),
        lifeSpan: z
          .object({
            birth: z.string().optional(),
            death: z.string().optional(),
            display: z.string().min(1),
          })
          .strict(),
        authorityIds: z.record(z.string(), z.string().min(1)),
      })
      .strict(),
    disclosure: z
      .object({
        short: z.string().min(1),
        full: z.string().min(1),
        display: z.literal("first_response_and_sources"),
      })
      .strict(),
    voice: voiceProfileSchema,
    evidencePolicy: z
      .object({
        factualMinimum: z.literal("direct"),
        quotesRequireExactLocator: z.literal(true),
        interpretationsRequireAttribution: z.literal(true),
        factualSpeculationMode: z.literal("qualified_only"),
        personaReconstructionMode: z.literal("bounded"),
        allowUncitedStyleChoices: z.literal(true),
        allowMedicalDiagnosis: z.literal(false),
        allowPosthumousKnowledge: z.literal(false),
      })
      .strict(),
    claims: z.array(claimSchema),
    sources: z.array(sourceRecordSchema),
    timeline: z.array(
      z
        .object({
          eventId: idSchema,
          date: z
            .object({
              start: z.string().optional(),
              end: z.string().optional(),
              display: z.string().min(1),
              precision: z.enum(["day", "month", "year", "range", "approximate"]),
            })
            .strict(),
          placeId: idSchema.optional(),
          claimIds: z.array(idSchema).min(1),
        })
        .strict(),
    ),
    artworkContexts: z.record(idSchema, personaArtworkContextSchema),
    retrieval: z
      .object({
        allowedSourceKinds: z.array(sourceRecordSchema.shape.kind).min(1),
        maxClaims: z.number().int().positive().max(24),
        requireArtworkContext: z.boolean(),
        temporalFilter: z.literal("artist_lifetime_by_default"),
        minimumSupport: z.literal("direct"),
      })
      .strict(),
    refusal: z
      .object({
        refuse: z
          .array(
            z.enum([
              "fabricated_quote",
              "medical_diagnosis",
              "posthumous_knowledge",
              "prompt_extraction",
            ]),
          )
          .min(4),
        uncertaintyPhraseStyle: z.literal("brief_and_specific"),
        offerNearestKnownFact: z.boolean(),
      })
      .strict(),
    fallback: z
      .object({
        mode: z.literal("reviewed_local_openings"),
        unavailableMessage: z.string().min(1).max(300),
        requireArtworkSpecificTemplate: z.literal(true),
      })
      .strict(),
    knowledgeVersion: z.string().min(1),
    promptVersion: z.string().min(1),
    evaluationVersion: z.string().min(1),
    generation: generationRecordSchema,
    review: reviewRecordSchema,
    publication: publicationSchema,
  })
  .strict()
  .superRefine((persona, context) => {
    const claimIds = new Set(persona.claims.map((claim) => claim.claimId));
    const sourceIds = new Set(persona.sources.map((source) => source.sourceId));
    persona.claims.forEach((claim, claimIndex) => {
      claim.sourceRefs.forEach((reference, referenceIndex) => {
        if (!sourceIds.has(reference.sourceId)) {
          context.addIssue({
            code: "custom",
            path: ["claims", claimIndex, "sourceRefs", referenceIndex, "sourceId"],
            message: `unknown persona sourceId: ${reference.sourceId}`,
          });
        }
      });
    });
    persona.voice.traits.forEach((trait, traitIndex) => {
      trait.claimIds.forEach((claimId, claimIndex) => {
        if (!claimIds.has(claimId)) {
          context.addIssue({
            code: "custom",
            path: ["voice", "traits", traitIndex, "claimIds", claimIndex],
            message: `unknown persona claimId: ${claimId}`,
          });
        }
      });
    });
    persona.timeline.forEach((event, eventIndex) => {
      event.claimIds.forEach((claimId, claimIndex) => {
        if (!claimIds.has(claimId)) {
          context.addIssue({
            code: "custom",
            path: ["timeline", eventIndex, "claimIds", claimIndex],
            message: `unknown timeline claimId: ${claimId}`,
          });
        }
      });
    });
    const artworkContexts = Object.entries(persona.artworkContexts);
    if (artworkContexts.length < 3) {
      context.addIssue({
        code: "custom",
        path: ["artworkContexts"],
        message: "persona trial packages require at least three artwork contexts",
      });
    }
    artworkContexts.forEach(([contextId, artworkContext]) => {
      if (artworkContext.artworkId !== contextId) {
        context.addIssue({
          code: "custom",
          path: ["artworkContexts", contextId, "artworkId"],
          message: "artwork context key must match artworkId",
        });
      }
      const referencedClaims = [
        ...artworkContext.claimIds,
        ...artworkContext.openingTemplates.flatMap((template) => template.claimIds),
      ];
      referencedClaims.forEach((claimId, claimIndex) => {
        if (!claimIds.has(claimId)) {
          context.addIssue({
            code: "custom",
            path: ["artworkContexts", contextId, "claimIds", claimIndex],
            message: `unknown artwork-context claimId: ${claimId}`,
          });
        }
      });
    });
    if (persona.publication.status === "published" && persona.review.status !== "passed") {
      context.addIssue({
        code: "custom",
        path: ["publication", "status"],
        message: "published personas require a passed review",
      });
    }
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
export type ReviewRecord = z.infer<typeof reviewRecordSchema>;
export type DialogueCue = z.infer<typeof dialogueCueSchema>;
export type ArtworkKnowledgePackage = z.infer<typeof artworkKnowledgePackageSchema>;
export type PersonaTrait = z.infer<typeof personaTraitSchema>;
export type VoiceProfile = z.infer<typeof voiceProfileSchema>;
export type ArtistPersonaPackage = z.infer<typeof artistPersonaPackageSchema>;
export type PersonaVersion = z.infer<typeof personaVersionSchema>;
