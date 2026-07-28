import { claudeMonetCandidate } from "../../../../ai/artist-profiles/claude-monet.mjs";
import { maryCassattCandidate } from "../../../../ai/artist-profiles/mary-cassatt.mjs";
import { vanGoghCandidate } from "../../../../ai/artist-profiles/van-gogh.mjs";
import { buildLocalPersonaIntroduction } from "../../../../ai/stage7/persona-runtime.mjs";

export type ReviewedPersonaOpening = {
  chinese: string;
  english: string;
  responseType: "imagined_response";
  citations: Array<{
    number: number;
    title: string;
    publisher: string;
    url: string;
    locator?: Record<string, string>;
    excerpt?: string;
    supportText?: string;
  }>;
  segments: Array<{
    chinese: string;
    english: string;
    citationNumbers: number[];
  }>;
};

const reviewedPersonas = [vanGoghCandidate, claudeMonetCandidate, maryCassattCandidate];
const reviewedSourceExcerpts: Record<string, string> = {
  "source:vangoghletters:chronology":
    "Vincent Willem van Gogh is born in Groot-Zundert, Markt 26, eldest son of the Reverend Theodorus van Gogh and Anna Cornelia van Gogh-Carbentus.",
  "source:vangoghletters:569":
    "But on the other hand there is more chance of selling. There is also a good chance of exchanging pictures with other artists.",
  "source:aic:self-portrait-80607":
    "In 1886 Vincent van Gogh left his native Holland and settled in Paris, where his beloved brother Theo was a dealer in paintings.",
};
const openingClaimGroups: Record<string, string[][]> = {
  "artic:28560": [
    ["claim:van-gogh:identity", "claim:van-gogh:bedroom-versions"],
    ["claim:van-gogh:bedroom-rest"],
    [],
  ],
  "artic:80607": [
    ["claim:van-gogh:identity", "claim:van-gogh:self-portrait", "claim:van-gogh:paris-exchange"],
    ["claim:van-gogh:self-portrait"],
    [],
  ],
  "artic:14586": [
    ["claim:van-gogh:identity", "claim:van-gogh:poets-garden"],
    ["claim:van-gogh:poets-garden"],
    [],
  ],
  "artic:81537": [
    ["claim:monet:identity", "claim:monet:bordighera-campaign"],
    ["claim:monet:bordighera-work"],
    [],
  ],
  "artic:64818": [
    ["claim:monet:identity", "claim:monet:stacks-artwork"],
    ["claim:monet:series-method"],
    [],
  ],
  "artic:87088": [
    ["claim:monet:identity", "claim:monet:giverny-garden"],
    ["claim:monet:giverny-garden", "claim:monet:water-garden-purpose"],
    [],
  ],
  "artic:26650": [
    ["claim:cassatt:identity", "claim:cassatt:balcony-identity"],
    ["claim:cassatt:balcony-modern-life"],
    ["claim:cassatt:balcony-identity"],
  ],
  "artic:111442": [
    ["claim:cassatt:identity", "claim:cassatt:child-bath-identity"],
    ["claim:cassatt:child-bath-composition"],
    ["claim:cassatt:child-bath-composition"],
    [],
  ],
  "artic:31816": [
    ["claim:cassatt:identity", "claim:cassatt:bullfight-identity"],
    ["claim:cassatt:bullfight-context"],
    [],
  ],
};

export function getReviewedPersonaForArtwork(artworkId: string) {
  const normalizedArtworkId = artworkId.startsWith("artic:") ? artworkId : `artic:${artworkId}`;
  return reviewedPersonas.find((candidate) =>
    Object.hasOwn(candidate.artworkContexts, normalizedArtworkId),
  );
}

export function getReviewedPersonaOpening(artworkId: string): ReviewedPersonaOpening | undefined {
  const normalizedArtworkId = artworkId.startsWith("artic:") ? artworkId : `artic:${artworkId}`;
  const persona = getReviewedPersonaForArtwork(normalizedArtworkId);
  if (!persona) return undefined;

  const opening = buildLocalPersonaIntroduction({
    persona,
    artworkId: normalizedArtworkId,
  });
  const personaClaims = persona.claims as unknown as Array<{
    claimId: string;
    text: string;
    sourceRefs: Array<{
      sourceId: string;
      locator?: Record<string, string | undefined>;
      excerpt?: string;
    }>;
  }>;
  const citations: Array<{
    number: number;
    sourceId: string;
    title: string;
    publisher: string;
    url: string;
    locator?: Record<string, string>;
    excerpt?: string;
    supportText?: string;
  }> = opening.evidence.map(
    (
      source: {
        id: string;
        title: string;
        description: string;
        url: string;
      },
      index: number,
    ) => {
      const matchingClaims = personaClaims.filter(
        (claim) =>
          openingClaimGroups[normalizedArtworkId]
            ?.flat()
            .includes(claim.claimId) &&
          claim.sourceRefs.some((reference) => reference.sourceId === source.id),
      );
      const matchingReference = matchingClaims
        .flatMap((claim) => claim.sourceRefs)
        .find((reference) => reference.sourceId === source.id);
      return {
        number: index + 1,
        sourceId: source.id,
        title: source.title,
        publisher: source.description,
        url: source.url,
        locator: matchingReference?.locator
          ? Object.fromEntries(
              Object.entries(matchingReference.locator).filter(
                (entry): entry is [string, string] => typeof entry[1] === "string",
              ),
            )
          : undefined,
        excerpt: matchingReference?.excerpt || reviewedSourceExcerpts[source.id],
        supportText: matchingClaims.map((claim: { text: string }) => claim.text).join(" "),
      };
    },
  );
  const citationNumberBySourceId = new Map(
    citations.map((citation) => [citation.sourceId, citation.number]),
  );
  const chineseSentences = opening.answer.match(/[^。！？]+[。！？]?/gu)?.filter(Boolean) || [
    opening.answer,
  ];
  const englishSentences = opening.englishAnswer.match(/[^.!?]+(?:[.!?]+|$)/g)?.filter(Boolean) || [
    opening.englishAnswer,
  ];
  const claimGroups = openingClaimGroups[normalizedArtworkId] || [];
  const segments = chineseSentences.map((chinese: string, index: number) => {
    const sourceIds = new Set(
      persona.claims
        .filter((claim: { claimId: string }) => (claimGroups[index] || []).includes(claim.claimId))
        .flatMap((claim: { sourceRefs: Array<{ sourceId: string }> }) =>
          claim.sourceRefs.map((reference) => reference.sourceId),
        ),
    );
    return {
      chinese,
      english: englishSentences[index] || "",
      citationNumbers: [...sourceIds]
        .map((sourceId) => citationNumberBySourceId.get(sourceId))
        .filter((number): number is number => number !== undefined),
    };
  });
  return {
    chinese: opening.answer,
    english: opening.englishAnswer,
    responseType: opening.responseType,
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
