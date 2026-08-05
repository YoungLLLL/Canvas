import { getArticArtwork } from "@/src/lib/artic";
import { getReviewedPersonaForArtwork } from "@/src/lib/persona-openings";
import type { Artwork } from "@/src/schemas/catalog";

const CATALOG_PERSONA_TTL_MS = 30 * 60 * 1000;

type RuntimeSourceRef = {
  sourceRefId: string;
  sourceId: string;
  support: "direct" | "indirect";
  locator: Record<string, string>;
  excerpt: string;
};

type RuntimeClaim = {
  claimId: string;
  subjectId: string;
  layer: "fact" | "interpretation";
  confidence: "high" | "medium";
  text: string;
  qualification?: string;
  sourceRefs: RuntimeSourceRef[];
};

export type ChatPersonaTier = "reviewed" | "catalog";

type CatalogPersona = ReturnType<typeof buildCatalogPersona>;
type ChatPersonaResolution = {
  persona: CatalogPersona | NonNullable<ReturnType<typeof getReviewedPersonaForArtwork>>;
  tier: ChatPersonaTier;
};

const catalogPersonaCache = new Map<
  string,
  { expiresAt: number; promise: Promise<ChatPersonaResolution | null> }
>();

function cleanArtistName(artwork: Artwork) {
  return (
    artwork.artist?.name ||
    artwork.display.artistDisplay.split(/\r?\n/u)[0]?.trim() ||
    "Unknown artist"
  );
}

function directReference(
  artwork: Artwork,
  suffix: string,
  field: string,
  excerpt: string,
): RuntimeSourceRef {
  return {
    sourceRefId: `ref:artic:${artwork.sourceId}:${suffix}`,
    sourceId: `source:artic:${artwork.sourceId}`,
    support: "direct",
    locator: { field },
    excerpt,
  };
}

export function buildCatalogPersona(artwork: Artwork) {
  const artworkId = `artic:${artwork.sourceId}`;
  const artistName = cleanArtistName(artwork);
  const unknownArtist = /^(?:artist )?unknown$|unknown artist|anonymous|佚名/iu.test(artistName);
  const artistId = artwork.artist?.id || `artic-artist:unknown-${artwork.sourceId}`;
  const claims: RuntimeClaim[] = [
    {
      claimId: `claim:artic:${artwork.sourceId}:attribution`,
      subjectId: artistId,
      layer: "fact",
      confidence: "high",
      text: unknownArtist
        ? `馆方将《${artwork.display.title}》的作者记录为未知或佚名。`
        : `馆方将《${artwork.display.title}》归于${artistName}。`,
      sourceRefs: [
        directReference(artwork, "attribution", "artist_title", artwork.display.artistDisplay),
      ],
    },
    {
      claimId: `claim:artic:${artwork.sourceId}:identity`,
      subjectId: artworkId,
      layer: "fact",
      confidence: "high",
      text: [
        `馆藏记录中的作品名为《${artwork.display.title}》`,
        artwork.display.dateDisplay ? `年代为${artwork.display.dateDisplay}` : "",
        artwork.display.mediumDisplay ? `媒材为${artwork.display.mediumDisplay}` : "",
        artwork.display.dimensionsDisplay ? `尺寸为${artwork.display.dimensionsDisplay}` : "",
      ]
        .filter(Boolean)
        .join("，")
        .concat("。"),
      sourceRefs: [
        directReference(
          artwork,
          "identity",
          "title,date_display,medium_display,dimensions",
          [
            artwork.display.title,
            artwork.display.dateDisplay,
            artwork.display.mediumDisplay,
            artwork.display.dimensionsDisplay,
          ]
            .filter(Boolean)
            .join(" · "),
        ),
      ],
    },
  ];

  if (artwork.description?.text) {
    const description = artwork.description.text.slice(0, 1_200);
    claims.push({
      claimId: `claim:artic:${artwork.sourceId}:description`,
      subjectId: artworkId,
      layer: "interpretation",
      confidence: "medium",
      text: `馆方作品说明提供了以下观察背景：${description}`,
      qualification: "这是馆方作品说明的摘要背景，不是艺术家本人的原话。",
      sourceRefs: [
        directReference(artwork, "description", artwork.description.sourceField, description),
      ],
    });
  }

  const claimIds = claims.map((claim) => claim.claimId);
  const disclosureSubject = unknownArtist ? "这件佚名作品" : artistName;

  return {
    personaId: `persona:catalog:${artwork.sourceId}`,
    artistId,
    promptVersion: "catalog-persona/1.0.0",
    identity: {
      displayName: disclosureSubject,
    },
    disclosure: {
      short: "基于馆藏记录生成的数字化对话，不代表艺术家原话。",
      full: [
        `这是围绕${disclosureSubject}与当前作品构建的馆藏资料人格，不是真实艺术家本人。`,
        "它只拥有下方馆方记录，不具备经过人工审核的完整生平、书信或个性材料。",
        unknownArtist
          ? "作者身份未知，不得声称具体姓名、经历、年代背景或私人动机。"
          : "不得把一般艺术史知识、推测或模型记忆冒充这位艺术家的真实经历和原话。",
      ].join(""),
    },
    voice: {
      traits: [
        {
          label: "谨慎、作品导向",
          basis: "museum_record",
          confidence: "medium",
          realization: ["从当前作品可见信息出发", "清楚区分馆藏事实与想象性推演"],
          avoid: ["伪造传记细节", "伪造引语或书信", "声称未经来源支持的创作动机"],
        },
      ],
    },
    sources: [
      {
        sourceId: `source:artic:${artwork.sourceId}`,
        kind: "museum_record",
        title: `${artwork.display.title} — The Art Institute of Chicago`,
        publisher: "The Art Institute of Chicago",
        url: artwork.source.recordUrl,
      },
    ],
    claims,
    artworkContexts: {
      [artworkId]: {
        artworkId,
        allowedTopics: [
          "当前作品的题名、年代、媒材、尺寸与馆藏记录",
          "对构图、色彩、笔触、题材和观看感受的谨慎观察",
          "明确标记为想象性回应的开放式观点",
        ],
        blockedInferences: [
          "未经来源支持的生平事件、人物关系、日期和地点",
          "艺术家的真实创作动机、私人感受、谈话、书信、日记或原话",
          "医学诊断、心理诊断和确定性的象征解释",
        ],
        claimIds,
        openingTemplates: [
          {
            text: `先从《${artwork.display.title}》本身开始吧。别急着为它下结论——你的目光最先停在哪一处细节、光线或颜色上？`,
            englishText: `Let us begin with ${artwork.display.title} itself. Before reaching for a conclusion, where does your eye settle first—on a detail, a passage of light, or a field of color?`,
            responseType: "imagined_response",
            perspective: "catalog_reconstruction",
            claimIds: [],
          },
        ],
      },
    },
    retrieval: {
      maxClaims: claims.length,
    },
    fallback: {
      unavailableMessage: "当前作品的馆藏资料暂时不可用。",
    },
    publication: {
      status: "runtime",
      version: "catalog-persona/1.0.0",
    },
  };
}

export async function resolveChatPersonaForArtwork(
  artworkId: string,
): Promise<ChatPersonaResolution | null> {
  const normalizedArtworkId = artworkId.startsWith("artic:") ? artworkId : `artic:${artworkId}`;
  const reviewedPersona = getReviewedPersonaForArtwork(normalizedArtworkId);
  if (reviewedPersona) return { persona: reviewedPersona, tier: "reviewed" };

  const sourceId = normalizedArtworkId.match(/^artic:(\d+)$/u)?.[1];
  if (!sourceId) return null;

  const cached = catalogPersonaCache.get(normalizedArtworkId);
  if (cached && Date.now() < cached.expiresAt) return cached.promise;

  const promise = getArticArtwork(sourceId).then((artwork) => {
    if (
      !artwork ||
      !["image_displayable", "metadata_only_no_image"].includes(artwork.eligibility.status)
    ) {
      return null;
    }
    return {
      persona: buildCatalogPersona(artwork),
      tier: "catalog" as const,
    };
  });
  catalogPersonaCache.set(normalizedArtworkId, {
    expiresAt: Date.now() + CATALOG_PERSONA_TTL_MS,
    promise,
  });
  void promise.catch(() => {
    if (catalogPersonaCache.get(normalizedArtworkId)?.promise === promise) {
      catalogPersonaCache.delete(normalizedArtworkId);
    }
  });
  if (catalogPersonaCache.size > 128) {
    catalogPersonaCache.delete(catalogPersonaCache.keys().next().value!);
  }
  return promise;
}
