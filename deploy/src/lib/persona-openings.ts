import { claudeMonetCandidate } from "../../ai/artist-profiles/claude-monet.mjs";
import { maryCassattCandidate } from "../../ai/artist-profiles/mary-cassatt.mjs";
import { vanGoghCandidate } from "../../ai/artist-profiles/van-gogh.mjs";
import { buildLocalPersonaIntroduction } from "../../ai/stage7/persona-runtime.mjs";
import type { ArtistPersonaPackage } from "@/src/schemas/ai-content";
import type { Artwork } from "@/src/schemas/catalog";

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

const reviewedPersonas: ArtistPersonaPackage[] = [
  vanGoghCandidate as unknown as ArtistPersonaPackage,
  claudeMonetCandidate as unknown as ArtistPersonaPackage,
  maryCassattCandidate as unknown as ArtistPersonaPackage,
];
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

export function getReviewedPersonaForArtist(artistId?: string, articArtistId?: string) {
  return reviewedPersonas.find(
    (candidate) =>
      candidate.artistId === artistId ||
      (articArtistId && candidate.identity.authorityIds.artic === articArtistId),
  );
}

function buildArtistLevelOpening(
  persona: ArtistPersonaPackage,
  artwork: Artwork,
  identityClaimId: string,
) {
  if (persona.artistId === "artic-artist:35809") {
    return {
      template: {
        templateId: `opening:${artwork.sourceId}:artist-level`,
        text: `我从来不喜欢理论抢在眼睛前面。面对《${artwork.display.title}》，先不要急着决定它代表什么；光线一变，颜色之间的关系也会跟着改变。告诉我，你的目光最先被哪一处变化留住？`,
        englishText: `I have never liked theory getting ahead of the eye. With ${artwork.display.title}, do not rush to decide what it means; when the light changes, the relationships between colors change with it. Tell me, which change holds your eye first?`,
        responseType: "imagined_response" as const,
        perspective: "retrospective" as const,
        claimIds: [identityClaimId, "claim:monet:direct-nature", "claim:monet:theory-boundary"],
      },
      claimGroups: [
        ["claim:monet:theory-boundary"],
        [identityClaimId, "claim:monet:direct-nature"],
        [],
      ],
    };
  }

  if (persona.artistId === "artic-artist:40610") {
    return {
      template: {
        templateId: `opening:${artwork.sourceId}:artist-level`,
        text: `别急着把《${artwork.display.title}》变成关于我的传说。先看颜色如何彼此推挤、笔触怎样把画面组织起来；这些具体的工作，比任何神话都更接近一幅画。告诉我，你先被哪一种颜色关系抓住？`,
        englishText: `Do not hurry to turn ${artwork.display.title} into a legend about me. First look at how the colors press against one another and how the brushwork organizes the picture; that concrete work comes closer to a painting than any myth. Tell me, which relationship of color catches you first?`,
        responseType: "imagined_response" as const,
        perspective: "retrospective" as const,
        claimIds: [identityClaimId],
      },
      claimGroups: [[identityClaimId], [], []],
    };
  }

  if (persona.artistId === "artic-artist:33890") {
    return {
      template: {
        templateId: `opening:${artwork.sourceId}:artist-level`,
        text: `先看《${artwork.display.title}》，不必急着猜艺术家的外表或私生活。画面怎样安排距离、动作和视线，往往比传记标签更值得停留。你最先注意到哪一种关系？`,
        englishText: `Begin with ${artwork.display.title}; there is no need to hurry toward the artist's appearance or private life. The way a picture arranges distance, gesture, and attention is often more worth our time than a biographical label. Which relationship do you notice first?`,
        responseType: "imagined_response" as const,
        perspective: "retrospective" as const,
        claimIds: [identityClaimId, "claim:cassatt:public-image"],
      },
      claimGroups: [[identityClaimId, "claim:cassatt:public-image"], [], []],
    };
  }

  return {
    template: {
      templateId: `opening:${artwork.sourceId}:artist-level`,
      text: `先从《${artwork.display.title}》本身开始吧。在替它下结论之前，我更想知道：你的目光最先停在哪一处颜色、光线或笔触上？`,
      englishText: `Let us begin with ${artwork.display.title} itself. Before deciding what it means, I would rather ask: where does your eye settle first—on a color, a passage of light, or a brushstroke?`,
      responseType: "imagined_response" as const,
      perspective: "retrospective" as const,
      claimIds: [identityClaimId],
    },
    claimGroups: [[identityClaimId], []],
  };
}

function buildArtistLevelArtworkContext(persona: ArtistPersonaPackage, artwork: Artwork) {
  const artworkId = artwork.id.startsWith("artic:") ? artwork.id : `artic:${artwork.sourceId}`;
  const sourceId = `source:artic:${artwork.sourceId}`;
  const attributionClaimId = `claim:artic:${artwork.sourceId}:attribution`;
  const identityClaimId = `claim:artic:${artwork.sourceId}:identity`;
  const descriptionClaimId = artwork.description?.text
    ? `claim:artic:${artwork.sourceId}:description`
    : undefined;
  const claims: ArtistPersonaPackage["claims"] = [
    {
      claimId: attributionClaimId,
      subjectId: artworkId,
      layer: "fact",
      text: `馆方将《${artwork.display.title}》归于${persona.identity.displayName}。`,
      predicate: "artist_attribution",
      sourceRefs: [
        {
          sourceRefId: `ref:artic:${artwork.sourceId}:attribution`,
          sourceId,
          locator: { section: "artist_title" },
          support: "direct",
          excerpt: artwork.display.artistDisplay,
        },
      ],
      visualEvidence: [],
      confidence: "high",
      status: "verified",
    },
    {
      claimId: identityClaimId,
      subjectId: artworkId,
      layer: "fact",
      text: [
        `馆藏记录中的作品名为《${artwork.display.title}》`,
        artwork.display.dateDisplay ? `年代为${artwork.display.dateDisplay}` : "",
        artwork.display.mediumDisplay ? `媒材为${artwork.display.mediumDisplay}` : "",
        artwork.display.dimensionsDisplay ? `尺寸为${artwork.display.dimensionsDisplay}` : "",
      ]
        .filter(Boolean)
        .join("，")
        .concat("。"),
      predicate: "artwork_identity",
      temporalScope:
        artwork.date.start || artwork.date.end
          ? {
              start: artwork.date.start?.toString(),
              end: artwork.date.end?.toString(),
              display: artwork.display.dateDisplay || undefined,
            }
          : undefined,
      sourceRefs: [
        {
          sourceRefId: `ref:artic:${artwork.sourceId}:identity`,
          sourceId,
          locator: { section: "title, date_display, medium_display, dimensions" },
          support: "direct",
          excerpt: [
            artwork.display.title,
            artwork.display.dateDisplay,
            artwork.display.mediumDisplay,
            artwork.display.dimensionsDisplay,
          ]
            .filter(Boolean)
            .join(" · "),
        },
      ],
      visualEvidence: [],
      confidence: "high",
      status: "verified",
    },
  ];

  if (artwork.description?.text && descriptionClaimId) {
    const description = artwork.description.text.slice(0, 1_200);
    claims.push({
      claimId: descriptionClaimId,
      subjectId: artworkId,
      layer: "interpretation",
      text: `馆方作品说明提供了以下观察背景：${description}`,
      predicate: "museum_description",
      sourceRefs: [
        {
          sourceRefId: `ref:artic:${artwork.sourceId}:description`,
          sourceId,
          locator: { section: artwork.description.sourceField },
          support: "direct",
          excerpt: description,
        },
      ],
      visualEvidence: [],
      confidence: "medium",
      status: "verified",
      qualification: "这是馆方作品说明的摘要背景，不是艺术家本人的原话。",
    });
  }

  const contextClaimIds = [attributionClaimId, identityClaimId, descriptionClaimId].filter(
    (claimId): claimId is string => Boolean(claimId),
  );
  const artistOpening = buildArtistLevelOpening(persona, artwork, identityClaimId);
  return {
    persona: {
      ...persona,
      claims: [...persona.claims, ...claims],
      sources: [
        ...persona.sources,
        {
          sourceId,
          kind: "museum_record" as const,
          title: `${artwork.display.title} — ${artwork.source.label}`,
          publisher: artwork.source.label,
          url: artwork.source.recordUrl,
          language: "en",
          accessedAt: artwork.source.accessedAt,
          reliability: "institutional" as const,
        },
      ],
      artworkContexts: {
        ...persona.artworkContexts,
        [artworkId]: {
          artworkId,
          activePeriod: {
            start: artwork.date.start?.toString(),
            end: artwork.date.end?.toString(),
          },
          claimIds: contextClaimIds,
          allowedTopics: [
            "当前作品的馆藏身份、年代、媒材、尺寸与馆方说明",
            "画面中可以直接观察到的构图、色彩、光线、笔触与题材",
            "基于艺术家已审核人格和生平资料的有边界回应",
          ],
          blockedInferences: [
            "把其他作品的专属史料、创作过程或动机套用到当前作品",
            "虚构当前作品对应的书信、日记、谈话、地点或私人感受",
            "把画面观察或人格推演冒充有记录的历史事实",
          ],
          openingTemplates: [artistOpening.template],
        },
      },
    },
    tier: "artist" as const,
    openingClaimGroups: artistOpening.claimGroups,
  };
}

export function getReviewedPersonaForCatalogArtwork(artwork: Artwork) {
  const exactPersona = getReviewedPersonaForArtwork(artwork.id);
  if (exactPersona) return { persona: exactPersona, tier: "artwork" as const };

  const artistPersona = getReviewedPersonaForArtist(artwork.artist?.id, artwork.artist?.sourceId);
  if (!artistPersona) return undefined;
  return buildArtistLevelArtworkContext(artistPersona, artwork);
}

function buildReviewedPersonaOpening(
  persona: ArtistPersonaPackage,
  artworkId: string,
  claimGroupsOverride?: string[][],
): ReviewedPersonaOpening {
  const normalizedArtworkId = artworkId.startsWith("artic:") ? artworkId : `artic:${artworkId}`;
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
          (claimGroupsOverride || openingClaimGroups[normalizedArtworkId])
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
  const claimGroups = claimGroupsOverride || openingClaimGroups[normalizedArtworkId] || [];
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

export function getReviewedPersonaOpening(artworkId: string): ReviewedPersonaOpening | undefined {
  const normalizedArtworkId = artworkId.startsWith("artic:") ? artworkId : `artic:${artworkId}`;
  const persona = getReviewedPersonaForArtwork(normalizedArtworkId);
  if (!persona) return undefined;
  return buildReviewedPersonaOpening(persona, normalizedArtworkId);
}

export function getReviewedPersonaOpeningForCatalogArtwork(
  artwork: Artwork,
): ReviewedPersonaOpening | undefined {
  const resolution = getReviewedPersonaForCatalogArtwork(artwork);
  if (!resolution) return undefined;
  const claimGroups = resolution.tier === "artist" ? resolution.openingClaimGroups : undefined;
  return buildReviewedPersonaOpening(resolution.persona, artwork.id, claimGroups);
}
