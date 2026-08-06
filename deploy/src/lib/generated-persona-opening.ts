import {
  assemblePersonaDialogue,
  finalizePersonaDialogue,
} from "../../ai/stage7/dialogue-assembler.mjs";

import {
  getReviewedPersonaForCatalogArtwork,
  type ReviewedPersonaOpening,
} from "@/src/lib/persona-openings";
import { createQwenJsonResponse, QwenRequestError, type QwenMessage } from "@/src/lib/qwen";
import type { Artwork } from "@/src/schemas/catalog";

const OPENING_CACHE_TTL_MS = 6 * 60 * 60 * 1_000;
const openingCache = new Map<
  string,
  { expiresAt: number; promise: Promise<ReviewedPersonaOpening | undefined> }
>();

function alignEnglishSegments(modelOutput: unknown) {
  if (!modelOutput || typeof modelOutput !== "object") return modelOutput;
  const output = modelOutput as {
    englishAnswer?: unknown;
    englishSegments?: unknown;
    segments?: unknown;
  };
  if (
    typeof output.englishAnswer !== "string" ||
    !Array.isArray(output.segments) ||
    output.segments.length === 0
  ) {
    return modelOutput;
  }

  const requestedCount = output.segments.length;
  if (
    Array.isArray(output.englishSegments) &&
    output.englishSegments.length === requestedCount &&
    output.englishSegments.every((segment) => typeof segment === "string")
  ) {
    return {
      ...output,
      englishAnswer: output.englishSegments.join(""),
    };
  }

  const sentences =
    output.englishAnswer
      .match(/[^.!?]+(?:[.!?]+|$)/g)
      ?.map((sentence) => sentence.trim())
      .filter(Boolean) || [];
  const units =
    sentences.length >= requestedCount
      ? sentences
      : output.englishAnswer.trim().split(/\s+/).filter(Boolean);
  const aligned = Array.from({ length: requestedCount }, (_, index) => {
    const start = Math.floor((index * units.length) / requestedCount);
    const end = Math.floor(((index + 1) * units.length) / requestedCount);
    const text = units.slice(start, end).join(" ");
    return index < requestedCount - 1 && text ? `${text} ` : text;
  });
  return {
    ...output,
    englishSegments: aligned,
    englishAnswer: aligned.join(""),
  };
}

function completeUsedEvidence(
  modelOutput: unknown,
  assembly: {
    claims: Array<{
      claimId: string;
      sourceRefs: Array<{ sourceRefId: string }>;
    }>;
  },
) {
  if (!modelOutput || typeof modelOutput !== "object") return modelOutput;
  const output = modelOutput as { segments?: unknown; evidenceRefIds?: unknown };
  if (!Array.isArray(output.segments)) return modelOutput;

  const usedClaimIds = new Set(
    output.segments.flatMap((segment) => {
      if (!segment || typeof segment !== "object") return [];
      const claimIds = (segment as { claimIds?: unknown }).claimIds;
      return Array.isArray(claimIds)
        ? claimIds.filter((claimId): claimId is string => typeof claimId === "string")
        : [];
    }),
  );
  const requiredEvidenceRefIds = assembly.claims
    .filter((claim) => usedClaimIds.has(claim.claimId))
    .flatMap((claim) => claim.sourceRefs.map((reference) => reference.sourceRefId));
  const suppliedEvidenceRefIds = Array.isArray(output.evidenceRefIds)
    ? output.evidenceRefIds.filter(
        (referenceId): referenceId is string => typeof referenceId === "string",
      )
    : [];

  return {
    ...output,
    evidenceRefIds: [...new Set([...suppliedEvidenceRefIds, ...requiredEvidenceRefIds])],
  };
}

function toOpening(
  dialogue: {
    answer: string;
    englishAnswer: string;
    englishSegments: string[];
    responseType: "evidence_based" | "imagined_response";
    segments: Array<{ text: string; claimIds: string[] }>;
    evidence: Array<{
      sourceRefId: string;
      sourceId: string;
      locator?: Record<string, string>;
      excerpt?: string;
    }>;
  },
  assembly: {
    claims: Array<{
      claimId: string;
      text: string;
      sourceRefs: Array<{ sourceRefId: string }>;
    }>;
    sources: Array<{
      sourceId: string;
      title: string;
      publisher?: string;
      url?: string;
    }>;
  },
): ReviewedPersonaOpening {
  if (dialogue.responseType !== "imagined_response") {
    throw new Error("Generated persona opening must be an imagined response");
  }

  const citations = dialogue.evidence.map((reference, index) => {
    const source = assembly.sources.find((candidate) => candidate.sourceId === reference.sourceId);
    const supportText = assembly.claims
      .filter((claim) =>
        claim.sourceRefs.some((candidate) => candidate.sourceRefId === reference.sourceRefId),
      )
      .map((claim) => claim.text)
      .join(" ");
    return {
      number: index + 1,
      sourceRefId: reference.sourceRefId,
      title: source?.title || reference.sourceId,
      publisher: source?.publisher || "",
      url: reference.locator?.fragmentUrl || source?.url || "",
      locator: reference.locator || {},
      excerpt: reference.excerpt || "",
      supportText,
    };
  });
  const citationNumberByRefId = new Map(
    citations.map((citation) => [citation.sourceRefId, citation.number]),
  );
  const segments = dialogue.segments.map((segment, index) => ({
    chinese: segment.text,
    english: dialogue.englishSegments[index],
    citationNumbers: [
      ...new Set(
        assembly.claims
          .filter((claim) => segment.claimIds.includes(claim.claimId))
          .flatMap((claim) =>
            claim.sourceRefs.map((reference) => citationNumberByRefId.get(reference.sourceRefId)),
          )
          .filter((number): number is number => number !== undefined),
      ),
    ],
  }));

  return {
    chinese: dialogue.answer,
    english: dialogue.englishAnswer,
    responseType: "imagined_response",
    citations: citations.map((citation) => ({
      number: citation.number,
      title: citation.title,
      publisher: citation.publisher,
      url: citation.url,
      locator: citation.locator,
      excerpt: citation.excerpt,
      supportText: citation.supportText,
    })),
    segments,
  };
}

async function generateOpening(artwork: Artwork): Promise<ReviewedPersonaOpening | undefined> {
  const resolution = getReviewedPersonaForCatalogArtwork(artwork);
  if (!resolution) return undefined;
  const assembly = assemblePersonaDialogue({
    persona: resolution.persona,
    artworkId: artwork.id,
  });
  const messages: QwenMessage[] = [
    {
      role: "system",
      content: `${assembly.instructions}\n\n这是作品页的第一段开场，不是对用户问题的回答。输出必须符合此 JSON Schema：${JSON.stringify(assembly.outputSchema)}`,
    },
    {
      role: "user",
      content: `请以${resolution.persona.identity.displayName}的第一人称，为刚打开《${artwork.display.title}》的观众写一段自然、有现场感的开场白。

方向：
- 2至4句，优先说清“我大约在什么时候画了这幅画，以及当时正在面对什么创作处境”。
- 年代、地点、行程、人物、创作过程和动机只能使用允许主张；没有证据时不要补造具体故事。
- 资料不足时，可以依据已审核人格和一般创作方法作克制的 persona_reconstruction，但不能把推演冒充史实。
- 必须针对当前作品变化措辞和结构，不要使用适用于所有作品的固定观察模板。
- 不要说“馆藏记录”“根据资料”“想象性声音”，不要解释系统规则，也不要加入免责声明。
- 不要求每次都以问题结尾；可以陈述、邀请观看或自然停顿。
- responseType 必须为 imagined_response。事实与解释绑定 claimIds；纯人格化推演可以不绑定 claimIds。`,
    },
  ];

  let lastError: unknown;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const generated = await createQwenJsonResponse(messages, (value) => value);
      const alignedOutput = alignEnglishSegments(generated.data);
      const completedOutput = completeUsedEvidence(alignedOutput, assembly);
      const dialogue = finalizePersonaDialogue({
        assembly,
        modelOutput: completedOutput,
        modelRevision: generated.model,
      });
      return toOpening(dialogue, assembly);
    } catch (error) {
      lastError = error;
      if (attempt === 2 || (error instanceof QwenRequestError && !error.retryable)) throw error;
    }
  }
  throw lastError;
}

export function generateReviewedPersonaOpeningForCatalogArtwork(artwork: Artwork) {
  const resolution = getReviewedPersonaForCatalogArtwork(artwork);
  if (!resolution) return Promise.resolve(undefined);
  const cacheKey = [
    resolution.persona.personaId,
    resolution.persona.publication.version,
    artwork.id,
    artwork.revision,
  ].join(":");
  const cached = openingCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) return cached.promise;

  const promise = generateOpening(artwork);
  openingCache.set(cacheKey, {
    expiresAt: Date.now() + OPENING_CACHE_TTL_MS,
    promise,
  });
  void promise.catch(() => {
    if (openingCache.get(cacheKey)?.promise === promise) openingCache.delete(cacheKey);
  });
  if (openingCache.size > 128) openingCache.delete(openingCache.keys().next().value!);
  return promise;
}
