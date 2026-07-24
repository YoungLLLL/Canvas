import type { ArtworkKnowledgePackage } from "../../../apps/web/src/schemas/ai-content.ts";
import type { Stage6GenerationContext, Stage6Provider } from "../pipeline.ts";

function localizedTitle(context: Stage6GenerationContext): string {
  const { artwork, locale } = context;
  return artwork.display.localizedTitles[locale] ?? artwork.display.title;
}

function museumSource(context: Stage6GenerationContext) {
  const { artwork, generatedAt, sourceSnapshots } = context;
  return {
    sourceId: `source:${artwork.id}:museum`,
    kind: "museum_record" as const,
    title: artwork.display.title,
    publisher: artwork.source.label,
    url: artwork.source.recordUrl,
    language: "en",
    accessedAt: generatedAt,
    contentHash: sourceSnapshots.museumRecord.contentHash,
    reliability: "institutional" as const,
    snapshotRef: sourceSnapshots.museumRecord.snapshotRef,
  };
}

export const stage6FixtureProvider: Stage6Provider = {
  id: "deterministic-fixture",
  model: "none",
  promptVersion: "stage6-fixture-v1",
  async generate(context): Promise<ArtworkKnowledgePackage> {
    const { artwork, locale, inputHash, generatedAt } = context;
    const title = localizedTitle(context);
    const source = museumSource(context);
    const titleClaimId = `claim:${artwork.id}:${locale}:title`;
    const artistClaimId = `claim:${artwork.id}:${locale}:artist`;
    const sourceRef = {
      sourceRefId: `source-ref:${artwork.id}:museum`,
      sourceId: source.sourceId,
      locator: { section: "object record" },
      support: "direct" as const,
    };
    const claimIds = [titleClaimId, artistClaimId];

    return {
      schemaVersion: "artwork-knowledge/2.0.0",
      packageId: `knowledge:${artwork.id}:${locale}:${inputHash.slice(0, 12)}`,
      artworkId: artwork.id,
      artworkRevision: artwork.revision,
      imageRevision: artwork.images.preferred?.id ?? null,
      locale,
      sources: [source],
      claims: [
        {
          claimId: titleClaimId,
          subjectId: artwork.id,
          layer: "fact",
          text: `The museum records this work as “${title}”.`,
          predicate: "title",
          value: title,
          sourceRefs: [sourceRef],
          visualEvidence: [],
          confidence: "high",
          status: "verified",
        },
        {
          claimId: artistClaimId,
          subjectId: artwork.id,
          layer: "fact",
          text: `The museum attributes this work to ${artwork.display.artistDisplay}.`,
          predicate: "artist",
          value: artwork.display.artistDisplay,
          sourceRefs: [sourceRef],
          visualEvidence: [],
          confidence: "high",
          status: "verified",
        },
      ],
      content: {
        introduction: {
          text: `${title} is attributed to ${artwork.display.artistDisplay}.`,
          claimIds,
        },
        tags: [],
        relations: [],
        palette: [],
        accessibility: null,
      },
      dialogueCues: [
        {
          cueId: `cue:${artwork.id}:${locale}:context`,
          artworkId: artwork.id,
          locale,
          topic: "context",
          triggerIntents: [
            title,
            artwork.display.artistDisplay,
            "artist",
            "title",
          ],
          claimIds,
          visualEvidenceIds: [],
          compatiblePersonaIds: [],
          move: "mention",
          transitionHint:
            "Use the verified museum title or attribution only when it answers the user's topic.",
          delivery: {
            minimumTurn: 1,
            cooldownTurns: 3,
            maxUsesPerConversation: 1,
            requiresUserInitiation: true,
          },
          confidence: "high",
          status: "verified",
        },
      ],
      sectionRuns: {
        facts: {
          status: "succeeded",
          attempt: 1,
          inputHash,
          outputHash: inputHash,
          updatedAt: generatedAt,
        },
        introduction: {
          status: "succeeded",
          attempt: 1,
          inputHash,
          outputHash: inputHash,
          updatedAt: generatedAt,
        },
        dialogueCues: {
          status: "succeeded",
          attempt: 1,
          inputHash,
          outputHash: inputHash,
          updatedAt: generatedAt,
        },
      },
      generation: {
        provider: "fixture",
        model: "none",
        promptVersion: "stage6-fixture-v1",
        generatedAt,
        inputHash,
      },
      review: {
        status: "pending",
        evaluationVersion: "stage6-eval-v1",
        issues: [],
      },
      publication: {
        status: "needs_review",
        version: `candidate-${inputHash.slice(0, 12)}`,
      },
    };
  },
};
