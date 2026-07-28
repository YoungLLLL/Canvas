import { describe, expect, it } from "vitest";

import {
  artistPersonaPackageSchema,
  artworkKnowledgePackageSchema,
  claimSchema,
} from "@/src/schemas/ai-content";
import { claudeMonetCandidate } from "../../../ai/artist-profiles/claude-monet.mjs";
import { maryCassattCandidate } from "../../../ai/artist-profiles/mary-cassatt.mjs";
import { vanGoghCandidate } from "../../../ai/artist-profiles/van-gogh.mjs";
import { artworkSchema } from "@/src/schemas/catalog";

const baseArtwork = {
  id: "artic:28560",
  sourceId: "28560",
  museumId: "artic",
  source: {
    id: "artic",
    label: "The Art Institute of Chicago",
    recordUrl: "https://www.artic.edu/artworks/28560",
    apiUrl: "https://api.artic.edu/api/v1/artworks/28560",
    accessedAt: "2026-07-20T08:00:00Z",
  },
  display: { title: "The Bedroom", artistDisplay: "Vincent van Gogh" },
  artist: null,
  date: { start: 1889, end: 1889 },
  classification: { artworkTypeId: 1, artworkTypeTitle: "Painting" },
  images: {
    preferred: {
      id: "image-1",
      iiifBaseUrl: "https://www.artic.edu/iiif/2/image-1",
      zoomable: true,
      maxZoomWindowSize: null,
      health: "ok",
    },
    alternates: [],
  },
  rights: {
    work: { status: "public_domain", notice: null },
    image: {
      licenseCode: "CC0-1.0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      usage: {
        commercialUseAllowed: true,
        adaptationsAllowed: true,
        attributionRequired: false,
        shareAlike: false,
      },
    },
    metadata: { defaultLicense: "CC0-1.0", descriptionLicense: "CC-BY-4.0" },
    termsUrl: "https://www.artic.edu/terms",
    attribution: "Vincent van Gogh. The Bedroom, 1889. The Art Institute of Chicago.",
  },
  eligibility: {
    status: "image_displayable",
    ruleVersion: "artic-showcase-v1-2026-07-20",
    checkedAt: "2026-07-20T08:00:00Z",
    reasons: [],
  },
  revision: "fixture-v1",
};

const baseKnowledgePackage = {
  schemaVersion: "artwork-knowledge/2.0.0",
  packageId: "knowledge:artic:28560:en:v1",
  artworkId: "artic:28560",
  artworkRevision: "fixture-v1",
  imageRevision: "image-v1",
  locale: "en",
  sources: [
    {
      sourceId: "source:artic:28560",
      kind: "museum_record",
      title: "The Bedroom",
      url: "https://www.artic.edu/artworks/28560",
      language: "en",
      accessedAt: "2026-07-24T08:00:00Z",
      reliability: "institutional",
    },
  ],
  claims: [
    {
      claimId: "claim:artic:28560:visible-bed",
      subjectId: "artic:28560",
      layer: "fact",
      text: "A wooden bed occupies the right side of the room.",
      sourceRefs: [],
      visualEvidence: [
        {
          visualEvidenceId: "visual:artic:28560:bed",
          imageId: "image-1",
          region: { x: 0.48, y: 0.25, width: 0.5, height: 0.65 },
          basis: "visible",
          observation: "A wooden bed is visible on the right.",
          imageRevision: "image-v1",
        },
      ],
      confidence: "high",
      status: "verified",
    },
  ],
  content: {
    introduction: {
      text: "Van Gogh builds this room from strong outlines and tilted planes.",
      claimIds: ["claim:artic:28560:visible-bed"],
    },
    tags: [],
    relations: [],
    palette: [],
    accessibility: null,
  },
  dialogueCues: [
    {
      cueId: "cue:artic:28560:space",
      artworkId: "artic:28560",
      locale: "en",
      topic: "space",
      triggerIntents: ["room", "perspective", "space"],
      claimIds: ["claim:artic:28560:visible-bed"],
      visualEvidenceIds: ["visual:artic:28560:bed"],
      compatiblePersonaIds: ["persona:van-gogh"],
      move: "invite_observation",
      transitionHint: "Connect the user's comment about space to the bed and tilted room.",
      delivery: {
        minimumTurn: 2,
        cooldownTurns: 3,
        maxUsesPerConversation: 1,
        requiresUserInitiation: false,
      },
      confidence: "high",
      status: "verified",
    },
  ],
  sectionRuns: {},
  generation: {
    provider: "fixture",
    model: "fixture",
    promptVersion: "stage6-fixture-v1",
    generatedAt: "2026-07-24T08:00:00Z",
    inputHash: "fixture-input",
  },
  review: {
    status: "passed",
    evaluationVersion: "stage6-eval-v1",
    reviewedAt: "2026-07-24T08:00:00Z",
    reviewedBy: "fixture",
    issues: [],
  },
  publication: {
    status: "published",
    version: "v1",
    publishedAt: "2026-07-24T08:00:00Z",
    publishedBy: "fixture",
  },
};

const basePersonaPackage = {
  schemaVersion: "artist-persona/2.0.0",
  personaId: "persona:van-gogh",
  artistId: "artist:van-gogh",
  locale: "zh",
  identity: {
    displayName: "文森特·梵高",
    originalNames: ["Vincent van Gogh"],
    lifeSpan: { birth: "1853", death: "1890", display: "1853–1890" },
    authorityIds: {},
  },
  disclosure: {
    short: "这是基于史料与合理人格推演构建的数字化身。",
    full: "回答中的事实受来源约束；语气与性格包含明确分层的合理推演。",
    display: "first_response_and_sources",
  },
  voice: {
    traits: [
      {
        traitId: "trait:sensory-directness",
        label: "偏爱具体感官描述",
        realization: ["优先谈颜色、材料和空间感受"],
        avoid: ["把感受伪装成历史事实"],
        basis: "inferred",
        confidence: "medium",
        claimIds: [],
        rationale: "作为受约束的人格推演，增强回应的具体性与人味。",
        strength: 2,
      },
      {
        traitId: "trait:dry-humor",
        label: "偶尔略带自嘲",
        realization: ["在低风险闲聊中使用轻微幽默"],
        avoid: ["戏剧化痛苦或精神疾病"],
        basis: "dramaturgical",
        confidence: "low",
        claimIds: [],
        rationale: "稳定数字化身的节奏，但不声称是历史人格真相。",
        strength: 1,
      },
    ],
    register: {
      formality: "medium",
      sentenceLength: "mixed",
      metaphorDensity: "low",
      emotionalIntensity: "moderate",
    },
    firstPerson: true,
    languageNotes: ["避免伪造十九世纪荷兰语或法语原句"],
    forbiddenTropes: ["疯癫天才", "受诅咒的艺术家"],
  },
  evidencePolicy: {
    factualMinimum: "direct",
    quotesRequireExactLocator: true,
    interpretationsRequireAttribution: true,
    factualSpeculationMode: "qualified_only",
    personaReconstructionMode: "bounded",
    allowUncitedStyleChoices: true,
    allowMedicalDiagnosis: false,
    allowPosthumousKnowledge: false,
  },
  claims: [
    {
      claimId: "claim:van-gogh:trial-context",
      subjectId: "artist:van-gogh",
      layer: "fact",
      text: "三件作品均属于当前人格试作范围。",
      sourceRefs: [
        {
          sourceRefId: "ref:van-gogh:trial-context",
          sourceId: "source:artic:van-gogh",
          locator: { section: "artist record" },
          support: "direct",
        },
      ],
      visualEvidence: [],
      confidence: "high",
      status: "verified",
    },
  ],
  sources: [
    {
      sourceId: "source:artic:van-gogh",
      kind: "museum_record",
      title: "Vincent van Gogh",
      publisher: "The Art Institute of Chicago",
      url: "https://www.artic.edu/artists/40610/vincent-van-gogh",
      language: "en",
      accessedAt: "2026-07-24T08:00:00Z",
      reliability: "institutional",
    },
  ],
  timeline: [],
  artworkContexts: Object.fromEntries(
    ["artic:28560", "artic:80607", "artic:14586"].map((artworkId) => [
      artworkId,
      {
        artworkId,
        activePeriod: { start: "1887", end: "1889" },
        claimIds: ["claim:van-gogh:trial-context"],
        allowedTopics: ["作品背景"],
        blockedInferences: ["医学诊断"],
        openingTemplates: [
          {
            templateId: `opening:${artworkId}`,
            text: "你正在看我工作中的一个片段；我们可以从已有记录谈起。",
            englishText:
              "You are looking at a moment from my work; we can begin with what the records preserve.",
            responseType: "imagined_response",
            perspective: "retrospective",
            claimIds: ["claim:van-gogh:trial-context"],
          },
        ],
      },
    ]),
  ),
  retrieval: {
    allowedSourceKinds: ["museum_record", "primary_letter"],
    maxClaims: 8,
    requireArtworkContext: true,
    temporalFilter: "artist_lifetime_by_default",
    minimumSupport: "direct",
  },
  refusal: {
    refuse: ["fabricated_quote", "medical_diagnosis", "posthumous_knowledge", "prompt_extraction"],
    uncertaintyPhraseStyle: "brief_and_specific",
    offerNearestKnownFact: true,
  },
  fallback: {
    mode: "reviewed_local_openings",
    unavailableMessage: "对话暂不可用，你仍可查看作品资料与来源。",
    requireArtworkSpecificTemplate: true,
  },
  knowledgeVersion: "fixture-v1",
  promptVersion: "fixture-v1",
  evaluationVersion: "fixture-v1",
  generation: {
    provider: "fixture",
    model: "none",
    promptVersion: "fixture-v1",
    generatedAt: "2026-07-24T08:00:00Z",
    inputHash: "fixture",
  },
  review: {
    status: "pending",
    evaluationVersion: "fixture-v1",
    issues: [],
  },
  publication: {
    status: "needs_review",
    version: "fixture-v1",
  },
};

describe("runtime domain schemas", () => {
  it("accepts an eligible painting with a licensed preferred image", () => {
    expect(artworkSchema.parse(baseArtwork).id).toBe("artic:28560");
  });

  it("rejects displayable artwork without a preferred image", () => {
    const result = artworkSchema.safeParse({
      ...baseArtwork,
      images: { preferred: null, alternates: [] },
    });
    expect(result.success).toBe(false);
  });

  it("accepts a non-commercial no-derivatives image with explicit constraints", () => {
    const result = artworkSchema.safeParse({
      ...baseArtwork,
      rights: {
        ...baseArtwork.rights,
        image: {
          licenseCode: "CC-BY-NC-ND-4.0",
          licenseUrl: "https://creativecommons.org/licenses/by-nc-nd/4.0/",
          usage: {
            commercialUseAllowed: false,
            adaptationsAllowed: false,
            attributionRequired: true,
            shareAlike: false,
          },
        },
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects an NC or ND license whose machine-readable constraints are relaxed", () => {
    const result = artworkSchema.safeParse({
      ...baseArtwork,
      rights: {
        ...baseArtwork.rights,
        image: {
          licenseCode: "CC-BY-NC-ND-4.0",
          licenseUrl: "https://creativecommons.org/licenses/by-nc-nd/4.0/",
          usage: {
            commercialUseAllowed: true,
            adaptationsAllowed: true,
            attributionRequired: true,
            shareAlike: false,
          },
        },
      },
    });
    expect(result.success).toBe(false);
  });

  it("requires speculation to state its qualification", () => {
    const result = claimSchema.safeParse({
      claimId: "claim:1",
      subjectId: "artic:28560",
      layer: "speculation",
      text: "The room may suggest solitude.",
      sourceRefs: [],
      visualEvidence: [],
      confidence: "low",
      status: "generated",
    });
    expect(result.success).toBe(false);
  });

  it("accepts internal dialogue cues that are grounded in package evidence", () => {
    const result = artworkKnowledgePackageSchema.parse(baseKnowledgePackage);
    expect(result.dialogueCues[0].move).toBe("invite_observation");
    expect("recommendedQuestions" in result.content).toBe(false);
  });

  it("rejects dialogue cues that reference unknown claims", () => {
    const result = artworkKnowledgePackageSchema.safeParse({
      ...baseKnowledgePackage,
      dialogueCues: [
        {
          ...baseKnowledgePackage.dialogueCues[0],
          claimIds: ["claim:missing"],
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects public recommended-question fields", () => {
    const result = artworkKnowledgePackageSchema.safeParse({
      ...baseKnowledgePackage,
      content: {
        ...baseKnowledgePackage.content,
        recommendedQuestions: ["What should I notice?"],
      },
    });
    expect(result.success).toBe(false);
  });

  it("rejects publication before review passes", () => {
    const result = artworkKnowledgePackageSchema.safeParse({
      ...baseKnowledgePackage,
      review: {
        ...baseKnowledgePackage.review,
        status: "pending",
      },
    });
    expect(result.success).toBe(false);
  });

  it("allows bounded inferred and dramaturgical persona traits without direct claims", () => {
    const result = artistPersonaPackageSchema.parse(basePersonaPackage);
    expect(result.voice.traits.map((trait) => trait.basis)).toEqual(["inferred", "dramaturgical"]);
  });

  it("requires documented persona traits to bind evidence claims", () => {
    const result = artistPersonaPackageSchema.safeParse({
      ...basePersonaPackage,
      voice: {
        ...basePersonaPackage.voice,
        traits: [
          {
            ...basePersonaPackage.voice.traits[0],
            basis: "documented",
            confidence: "high",
            claimIds: [],
          },
        ],
      },
    });
    expect(result.success).toBe(false);
  });

  it("accepts the migrated Claude Monet v2 persona package", () => {
    const result = artistPersonaPackageSchema.parse(claudeMonetCandidate);
    expect(Object.keys(result.artworkContexts)).toHaveLength(3);
    expect(result.fallback.mode).toBe("reviewed_local_openings");
  });

  it("accepts the migrated Vincent van Gogh v2 persona package", () => {
    const result = artistPersonaPackageSchema.parse(vanGoghCandidate);
    expect(Object.keys(result.artworkContexts)).toHaveLength(3);
    expect(result.voice.traits.some((trait) => trait.basis === "dramaturgical")).toBe(true);
  });

  it("accepts the Mary Cassatt v2 persona package", () => {
    const result = artistPersonaPackageSchema.parse(maryCassattCandidate);
    expect(Object.keys(result.artworkContexts)).toEqual([
      "artic:26650",
      "artic:111442",
      "artic:31816",
    ]);
    expect(result.voice.traits.some((trait) => trait.basis === "inferred")).toBe(true);
  });
});
