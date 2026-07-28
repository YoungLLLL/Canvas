"use client";

import { FormEvent, PointerEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

import { CollectionBackLink } from "@/src/components/collection-state";

import styles from "./chat-prototype.module.css";

const ARTWORK_IMAGE = "/chat/van-gogh-self-portrait-1889.jpg";

type Citation = {
  number: number;
  title: string;
  publisher: string;
  url: string;
  locator?: Record<string, string>;
  excerpt?: string;
  supportText?: string;
};

type MessageSegment = {
  chinese: string;
  english: string;
  citationNumbers: number[];
};

type Message = {
  id: number;
  role: "question" | "answer";
  chinese: string;
  english: string;
  responseType?: "imagined_response";
  citations?: Citation[];
  segments?: MessageSegment[];
};

type ArtworkIdentityProps = {
  artist: string;
  year: string;
  title: string;
  medium: string;
  dimensions: string;
  collection: string;
};

export type ArtistProfile = {
  name: string;
  localizedName: string;
  life: string;
  country: string;
  localizedCountry: string;
  style: Array<{ english: string; chinese: string }>;
  subjects: Array<{ english: string; chinese: string }>;
  legacy: { english: string; chinese: string };
  sources?: Array<{ label: string; url: string }>;
};

type ChatPrototypeProps = {
  locale?: "en" | "zh";
  artworkId?: string;
  opening?: {
    chinese: string;
    english: string;
    responseType: "imagined_response";
    citations?: Citation[];
    segments?: MessageSegment[];
  };
  artwork?: Partial<ArtworkIdentityProps> & {
    imageUrl?: string | null;
    artistProfile?: ArtistProfile;
    sourceUrl?: string;
  };
};

const DEFAULT_ARTWORK: ArtworkIdentityProps & { imageUrl: string } = {
  artist: "Vincent Van Gogh",
  year: "1889",
  title: "THE BEDROOM",
  medium: "OIL ON CANVAS",
  dimensions: "72.4 × 91.3 CM",
  collection: "ART INSTITUTE OF CHICAGO",
  imageUrl: ARTWORK_IMAGE,
};

const ARTIST_PROFILES: Array<{ matches: RegExp; profile: ArtistProfile }> = [
  {
    matches: /van gogh|梵高/i,
    profile: {
      name: "Vincent Van Gogh",
      localizedName: "文森特·梵高",
      life: "1853–1890",
      country: "The Netherlands",
      localizedCountry: "荷兰",
      style: [
        { english: "Bold Colors", chinese: "浓烈色彩" },
        { english: "Expressive Brushstrokes", chinese: "情绪化笔触" },
      ],
      subjects: [
        { english: "Sunflowers", chinese: "向日葵" },
        { english: "Starry Nights", chinese: "星空" },
      ],
      legacy: {
        english: "Forever Changed Modern Art",
        chinese: "永远改变了现代艺术",
      },
      sources: [
        {
          label: "Wikipedia",
          url: "https://en.wikipedia.org/wiki/Vincent_van_Gogh",
        },
      ],
    },
  },
  {
    matches: /james peale|詹姆斯[·・]?皮尔/i,
    profile: {
      name: "James Peale",
      localizedName: "詹姆斯·皮尔",
      life: "1749–1831",
      country: "United States",
      localizedCountry: "美国",
      style: [
        { english: "Portraiture", chinese: "肖像画" },
        { english: "Miniature Painting", chinese: "细密肖像画" },
        { english: "Still Life", chinese: "静物画" },
      ],
      subjects: [
        { english: "Portraits", chinese: "人物肖像" },
        { english: "Family", chinese: "家庭" },
        { english: "Fruit and Flowers", chinese: "果实与花卉" },
      ],
      legacy: {
        english: "A Leading Early American Miniaturist",
        chinese: "美国早期重要的细密肖像画家",
      },
      sources: [
        {
          label: "Smithsonian American Art Museum",
          url: "https://americanart.si.edu/artist/james-peale-3721",
        },
      ],
    },
  },
  {
    matches: /peter paul rubens|彼得[·・]?保罗[·・]?鲁本斯/i,
    profile: {
      name: "Peter Paul Rubens",
      localizedName: "彼得·保罗·鲁本斯",
      life: "1577–1640",
      country: "Siegen, Germany",
      localizedCountry: "德国锡根",
      style: [
        { english: "Flemish Baroque", chinese: "佛兰德斯巴洛克" },
        { english: "Dynamic Composition", chinese: "动态构图" },
        { english: "Vibrant Color", chinese: "鲜明色彩" },
      ],
      subjects: [
        { english: "Religious Scenes", chinese: "宗教题材" },
        { english: "Mythology", chinese: "神话" },
        { english: "Portraits", chinese: "肖像" },
      ],
      legacy: {
        english: "A Defining Master of Northern European Baroque",
        chinese: "北欧巴洛克艺术的重要大师",
      },
      sources: [
        {
          label: "National Gallery, London",
          url: "https://www.nationalgallery.org.uk/artists/peter-paul-rubens",
        },
        {
          label: "The Metropolitan Museum of Art",
          url: "https://www.metmuseum.org/exhibitions/listings/2005/rubens-drawings",
        },
      ],
    },
  },
  {
    matches: /[ée]douard manet|爱德华[·・]?马奈/i,
    profile: {
      name: "Édouard Manet",
      localizedName: "爱德华·马奈",
      life: "1832–1883",
      country: "France",
      localizedCountry: "法国",
      style: [
        { english: "Realism", chinese: "现实主义" },
        { english: "Early Modernism", chinese: "早期现代主义" },
      ],
      subjects: [
        { english: "Modern Life", chinese: "现代生活" },
        { english: "Portraits", chinese: "肖像" },
        { english: "Parisian Society", chinese: "巴黎社会" },
      ],
      legacy: {
        english: "A Pivotal Figure between Realism and Impressionism",
        chinese: "连接现实主义与印象主义的关键人物",
      },
      sources: [
        {
          label: "The Metropolitan Museum of Art",
          url: "https://www.metmuseum.org/essays/edouard-manet-1832-1883",
        },
        {
          label: "Wikipedia",
          url: "https://en.wikipedia.org/wiki/%C3%89douard_Manet",
        },
      ],
    },
  },
  {
    matches: /jacob jordaens|雅各布[·・]?约尔丹斯/i,
    profile: {
      name: "Jacob Jordaens",
      localizedName: "雅各布·约尔丹斯",
      life: "1593–1678",
      country: "Flanders",
      localizedCountry: "佛兰德斯",
      style: [
        { english: "Flemish Baroque", chinese: "佛兰德斯巴洛克" },
        { english: "Robust Naturalism", chinese: "强烈的自然主义" },
      ],
      subjects: [
        { english: "Religious Scenes", chinese: "宗教题材" },
        { english: "Mythology", chinese: "神话" },
        { english: "Genre Scenes", chinese: "风俗场景" },
      ],
      legacy: {
        english: "A Leading Antwerp Painter after Rubens",
        chinese: "鲁本斯之后安特卫普的重要画家",
      },
      sources: [
        {
          label: "Wikipedia",
          url: "https://en.wikipedia.org/wiki/Jacob_Jordaens",
        },
      ],
    },
  },
  {
    matches: /antonio (?:de )?puga|安东尼奥[·・]?普加/i,
    profile: {
      name: "Antonio de Puga",
      localizedName: "安东尼奥·德·普加",
      life: "1602–1648",
      country: "Spain",
      localizedCountry: "西班牙",
      style: [{ english: "Spanish Baroque", chinese: "西班牙巴洛克" }],
      subjects: [
        { english: "Genre Scenes", chinese: "风俗场景" },
        { english: "Portraits", chinese: "肖像" },
        { english: "Religious Painting", chinese: "宗教画" },
      ],
      legacy: {
        english: "The First Notable Painter from Galicia",
        chinese: "加利西亚地区第一位重要画家",
      },
      sources: [
        {
          label: "Museo Nacional del Prado",
          url: "https://www.museodelprado.es/coleccion/artista/antonio-puga/4cbebf67-b5b5-4d41-a6ff-888e91ba383b",
        },
        {
          label: "Wikipedia",
          url: "https://en.wikipedia.org/wiki/Antonio_de_Puga",
        },
      ],
    },
  },
  {
    matches: /frans pourbus the younger|小弗兰斯[·・]?普布斯/i,
    profile: {
      name: "Frans Pourbus the Younger",
      localizedName: "小弗兰斯·普布斯",
      life: "1569–1622",
      country: "Flanders",
      localizedCountry: "佛兰德斯",
      style: [
        { english: "Court Portraiture", chinese: "宫廷肖像画" },
        { english: "Meticulous Realism", chinese: "细致写实" },
      ],
      subjects: [
        { english: "Royalty", chinese: "王室成员" },
        { english: "Aristocracy", chinese: "贵族" },
        { english: "Court Dress", chinese: "宫廷服饰" },
      ],
      legacy: {
        english: "An International Court Portraitist",
        chinese: "活跃于欧洲多国宫廷的重要肖像画家",
      },
      sources: [
        {
          label: "Wikipedia",
          url: "https://en.wikipedia.org/wiki/Frans_Pourbus_the_Younger",
        },
      ],
    },
  },
  {
    matches: /luca cambiaso|卢卡[·・]?坎比亚索/i,
    profile: {
      name: "Luca Cambiaso",
      localizedName: "卢卡·坎比亚索",
      life: "1527–1585",
      country: "Italy",
      localizedCountry: "意大利",
      style: [
        { english: "Mannerism", chinese: "矫饰主义" },
        { english: "Geometric Draftsmanship", chinese: "几何化造型" },
        { english: "Nocturnal Light", chinese: "夜景光线" },
      ],
      subjects: [
        { english: "Religious Scenes", chinese: "宗教题材" },
        { english: "Mythology", chinese: "神话" },
        { english: "Fresco Decoration", chinese: "湿壁画装饰" },
      ],
      legacy: {
        english: "Founder of the Genoese School",
        chinese: "热那亚画派的奠基者",
      },
      sources: [
        {
          label: "Wikipedia",
          url: "https://en.wikipedia.org/wiki/Luca_Cambiaso",
        },
      ],
    },
  },
  {
    matches: /apollonio di giovanni|阿波洛尼奥[·・]?迪[·・]?乔瓦尼/i,
    profile: {
      name: "Apollonio di Giovanni",
      localizedName: "阿波洛尼奥·迪·乔瓦尼",
      life: "1415/17–1465",
      country: "Florence",
      localizedCountry: "佛罗伦萨",
      style: [{ english: "Early Renaissance Narrative Painting", chinese: "早期文艺复兴叙事绘画" }],
      subjects: [
        { english: "Classical Literature", chinese: "古典文学" },
        { english: "Ancient History", chinese: "古代历史" },
        { english: "Wedding Chests", chinese: "婚礼箱画" },
      ],
      legacy: {
        english: "A Leading Florentine Cassone Painter",
        chinese: "佛罗伦萨重要的婚礼箱画家",
      },
      sources: [
        {
          label: "Wikipedia",
          url: "https://it.wikipedia.org/wiki/Apollonio_di_Giovanni",
        },
      ],
    },
  },
  {
    matches: /giovanni battista tiepolo|乔瓦尼[·・]?巴蒂斯塔[·・]?提埃波罗/i,
    profile: {
      name: "Giovanni Battista Tiepolo",
      localizedName: "乔瓦尼·巴蒂斯塔·提埃波罗",
      life: "1696–1770",
      country: "Venice",
      localizedCountry: "威尼斯",
      style: [
        { english: "Italian Rococo", chinese: "意大利洛可可" },
        { english: "Luminous Fresco Painting", chinese: "明亮的湿壁画" },
      ],
      subjects: [
        { english: "Religious Scenes", chinese: "宗教题材" },
        { english: "Mythology", chinese: "神话" },
        { english: "Allegory", chinese: "寓意画" },
      ],
      legacy: {
        english: "The Greatest Italian Rococo Painter",
        chinese: "意大利洛可可绘画的杰出大师",
      },
      sources: [
        {
          label: "National Gallery, London",
          url: "https://www.nationalgallery.org.uk/artists/giovanni-battista-tiepolo",
        },
      ],
    },
  },
  {
    matches: /artist unknown.*french.*active 18th century/i,
    profile: {
      name: "Artist unknown",
      localizedName: "法国佚名艺术家",
      life: "Active 18th century",
      country: "France",
      localizedCountry: "18世纪活跃于法国",
      style: [{ english: "18th-Century French Portraiture", chinese: "18世纪法国肖像画" }],
      subjects: [
        { english: "Portraits", chinese: "肖像" },
        { english: "Fashion", chinese: "服饰" },
      ],
      legacy: {
        english: "Identity Not Yet Established",
        chinese: "作者身份尚待考证",
      },
      sources: [
        {
          label: "Art Institute of Chicago",
          url: "https://www.artic.edu/artworks/44886/woman-in-a-straw-hat",
        },
      ],
    },
  },
];

function artistNameOnly(artist: string) {
  return (
    artist
      .split(/\r?\n/)[0]
      ?.replace(/\s*\([^)]*(?:\d{4}|American|Dutch)[^)]*\)\s*$/i, "")
      .trim() || artist
  );
}

const NATIONALITY_LABELS: Record<string, string> = {
  american: "美国",
  british: "英国",
  dutch: "荷兰",
  flemish: "佛兰德斯",
  french: "法国",
  german: "德国",
  italian: "意大利",
  spanish: "西班牙",
};

function resolveArtistProfile(
  artist: string,
  profile?: ArtistProfile,
  sourceUrl?: string,
): ArtistProfile {
  if (profile) return profile;
  const knownProfile = ARTIST_PROFILES.find(({ matches }) => matches.test(artist));
  if (knownProfile) return knownProfile.profile;

  const attribution = artist.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  const name = attribution?.[1]?.trim() || artistNameOnly(artist);
  const details = attribution?.[2] || "";
  const life =
    details.match(/\b\d{4}(?:\/\d{2})?\s*[–-]\s*\d{4}\b/)?.[0] ||
    details.match(/\bactive\s+[^,]+/i)?.[0] ||
    "Not recorded";
  const nationality =
    Object.keys(NATIONALITY_LABELS).find((label) =>
      new RegExp(`\\b${label}\\b`, "i").test(details),
    ) || "";
  const country = nationality
    ? `${nationality.charAt(0).toUpperCase()}${nationality.slice(1)}`
    : "Attribution recorded by the museum";
  const localizedCountry = nationality ? NATIONALITY_LABELS[nationality] : "馆藏记录所载归属";

  return {
    name,
    localizedName: /artist unknown|unknown artist/i.test(name) ? "佚名艺术家" : name,
    life,
    country,
    localizedCountry,
    style: [{ english: "Not Reliably Documented", chinese: "尚无可靠资料" }],
    subjects: [{ english: "Not Reliably Documented", chinese: "尚无可靠资料" }],
    legacy: {
      english: "Not Reliably Documented",
      chinese: "尚无可靠资料",
    },
    sources: sourceUrl ? [{ label: "Art Institute of Chicago", url: sourceUrl }] : undefined,
  };
}

function BilingualTerms({ terms }: { terms: ArtistProfile["style"] }) {
  return terms.map((term, index) => (
    <span key={`${term.english}-${term.chinese}`}>
      {index > 0 ? ", " : null}
      {term.english} {term.chinese}
    </span>
  ));
}

function createInitialMessages(
  artwork: ArtworkIdentityProps,
  opening?: ChatPrototypeProps["opening"],
): Message[] {
  if (opening) {
    return [
      {
        id: 1,
        role: "answer",
        chinese: opening.chinese,
        english: opening.english,
        responseType: opening.responseType,
        citations: opening.citations,
        segments: opening.segments,
      },
    ];
  }

  return [
    {
      id: 1,
      role: "answer",
      chinese: `《${artwork.title}》留在了${artwork.year || "一个年代待考的时刻"}。先别急着寻找结论，看看画面最先把你的目光带到了哪里。`,
      english: `${artwork.title} belongs to ${artwork.year || "a date still under study"}. Before looking for a conclusion, notice where the painting first takes your eye.`,
      responseType: "imagined_response",
    },
  ];
}

function ArtworkIdentity({
  artist,
  year,
  title,
  medium,
  dimensions,
  collection,
}: ArtworkIdentityProps) {
  return (
    <dl className={styles.artworkCaption}>
      <div className={styles.artistLine}>
        <dt className="sr-only">Artist and year</dt>
        <dd>
          <strong>{artist}</strong>
          <span>{year}</span>
        </dd>
      </div>
      <div>
        <dt className="sr-only">Artwork title</dt>
        <dd>[ {title} ]</dd>
      </div>
      <div>
        <dt className="sr-only">Medium</dt>
        <dd>{medium}</dd>
      </div>
      <div>
        <dt className="sr-only">Dimensions</dt>
        <dd>{dimensions}</dd>
      </div>
      <div>
        <dt className="sr-only">Collection</dt>
        <dd>{collection}</dd>
      </div>
    </dl>
  );
}

function nextAnswer(question: string): Pick<Message, "chinese" | "english"> {
  if (/颜色|color/i.test(question)) {
    return {
      chinese: "我想让颜色替我说话，让色彩之间的关系传达作品的情绪与节奏。",
      english:
        "I wanted color to speak, using its relationships to carry the work's mood and rhythm.",
    };
  }

  if (/倾斜|歪|perspective|tilt/i.test(question)) {
    return {
      chinese: "我有意组织并简化了透视。这里追求的不是机械的精确，而是一种直接的观看感受。",
      english:
        "I organized and simplified the perspective. The aim was a direct experience, not mechanical precision.",
    };
  }

  return {
    chinese: "我通过颜色、形状和笔触组织这件作品，希望它能直接传达我观看时的感受。",
    english:
      "I shaped this work through color, form, and brushwork to convey the feeling of looking.",
  };
}

export function ChatPrototype({ locale = "zh", artworkId, opening, artwork }: ChatPrototypeProps) {
  const selectedArtwork = {
    artist: artwork?.artist || DEFAULT_ARTWORK.artist,
    year: artwork?.year || DEFAULT_ARTWORK.year,
    title: artwork?.title || DEFAULT_ARTWORK.title,
    medium: artwork?.medium || DEFAULT_ARTWORK.medium,
    dimensions: artwork?.dimensions || DEFAULT_ARTWORK.dimensions,
    collection: artwork?.collection || DEFAULT_ARTWORK.collection,
    imageUrl:
      artwork && Object.prototype.hasOwnProperty.call(artwork, "imageUrl")
        ? artwork.imageUrl
        : DEFAULT_ARTWORK.imageUrl,
    sourceUrl: artwork?.sourceUrl,
  };
  const artistProfile = resolveArtistProfile(
    selectedArtwork.artist,
    artwork?.artistProfile,
    selectedArtwork.sourceUrl,
  );
  const profileSources = [
    ...(selectedArtwork.sourceUrl
      ? [{ label: "Art Institute of Chicago", url: selectedArtwork.sourceUrl }]
      : []),
    ...(artistProfile.sources || []),
  ].filter(
    (source, index, sources) =>
      sources.findIndex(
        (candidate) => candidate.url === source.url || candidate.label === source.label,
      ) === index,
  );
  const isVanGogh = /van gogh|梵高/i.test(selectedArtwork.artist);
  const [messages, setMessages] = useState(() => createInitialMessages(selectedArtwork, opening));
  const [draft, setDraft] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatError, setChatError] = useState("");
  const [activeCitation, setActiveCitation] = useState<{
    messageId: number;
    number: number;
    top: number;
    left: number;
  } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isComposerExpanded, setIsComposerExpanded] = useState(false);
  const [artworkScale, setArtworkScale] = useState(1);
  const [artworkOrigin, setArtworkOrigin] = useState({ x: 50, y: 50 });
  const [artworkOffset, setArtworkOffset] = useState({ x: 0, y: 0 });
  const [isDraggingArtwork, setIsDraggingArtwork] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const composerInputRef = useRef<HTMLInputElement>(null);
  const artworkDragRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    if (messages.length > 1 || isGenerating) {
      feedRef.current?.scrollTo({
        top: feedRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isGenerating]);

  useEffect(() => {
    if (isComposerExpanded && !isListening) {
      composerInputRef.current?.focus({ preventScroll: true });
    }
  }, [isComposerExpanded, isListening]);

  useEffect(() => {
    if (!activeCitation) return;
    const closeFloatingCitation = () => setActiveCitation(null);
    window.addEventListener("resize", closeFloatingCitation);
    window.addEventListener("scroll", closeFloatingCitation, true);
    return () => {
      window.removeEventListener("resize", closeFloatingCitation);
      window.removeEventListener("scroll", closeFloatingCitation, true);
    };
  }, [activeCitation]);

  async function submitQuestion(event?: FormEvent) {
    event?.preventDefault();
    const question = draft.trim();
    if (!question || isGenerating) return;

    const baseId = Date.now();
    const questionMessage: Message = {
      id: baseId,
      role: "question",
      chinese: question,
      english: "",
    };
    const history = messages.slice(-10).map((message) => ({
      role: message.role === "question" ? ("user" as const) : ("assistant" as const),
      content: message.chinese,
    }));
    setMessages((current) => [...current, questionMessage]);
    setDraft("");
    setIsComposerExpanded(false);
    setChatError("");

    if (!artworkId) {
      setMessages((current) => [
        ...current,
        { id: baseId + 1, role: "answer", ...nextAnswer(question) },
      ]);
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artworkId,
          message: question,
          history,
        }),
      });
      const body = (await response.json()) as {
        answer?: string;
        englishAnswer?: string;
        responseType?: "evidence_based" | "imagined_response";
        citations?: Citation[];
        displaySegments?: MessageSegment[];
        error?: string;
      };
      if (!response.ok || !body.answer || !body.englishAnswer) {
        throw new Error(body.error || "暂时无法生成回答。");
      }
      setMessages((current) => [
        ...current,
        {
          id: baseId + 1,
          role: "answer",
          chinese: body.answer!,
          english: body.englishAnswer!,
          responseType: body.responseType === "imagined_response" ? "imagined_response" : undefined,
          citations: body.citations,
          segments: body.displaySegments,
        },
      ]);
    } catch (error) {
      setChatError(error instanceof Error ? error.message : "暂时无法生成回答。");
    } finally {
      setIsGenerating(false);
    }
  }

  function zoomArtwork(event: React.WheelEvent<HTMLElement>) {
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    const nextScale = Math.min(
      4,
      Math.max(1, Number((artworkScale + (event.deltaY < 0 ? 0.18 : -0.18)).toFixed(2))),
    );

    setArtworkOrigin({
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
    });
    setArtworkScale(nextScale);
    if (nextScale === 1) {
      setArtworkOrigin({ x: 50, y: 50 });
      setArtworkOffset({ x: 0, y: 0 });
    }
  }

  function resetArtwork() {
    setArtworkScale(1);
    setArtworkOrigin({ x: 50, y: 50 });
    setArtworkOffset({ x: 0, y: 0 });
  }

  function startArtworkDrag(event: PointerEvent<HTMLImageElement>) {
    if (artworkScale === 1 || event.button !== 0) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    artworkDragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    setIsDraggingArtwork(true);
  }

  function dragArtwork(event: PointerEvent<HTMLImageElement>) {
    const drag = artworkDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.x;
    const deltaY = event.clientY - drag.y;
    artworkDragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    setArtworkOffset((current) => ({
      x: current.x + deltaX,
      y: current.y + deltaY,
    }));
  }

  function stopArtworkDrag(event: PointerEvent<HTMLImageElement>) {
    if (artworkDragRef.current?.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    artworkDragRef.current = null;
    setIsDraggingArtwork(false);
  }

  function handleComposerAction() {
    if (isListening) {
      setIsListening(false);
      setIsComposerExpanded(true);
      return;
    }

    if (draft.trim()) {
      submitQuestion();
      return;
    }

    setIsComposerExpanded(true);
    setIsListening(true);
  }

  function collapseEmptyComposer() {
    if (!draft.trim() && !isListening) {
      composerInputRef.current?.blur();
      setIsComposerExpanded(false);
    }
  }

  function renderCitations(message: Message, citationNumbers: number[], language: "en" | "zh") {
    return citationNumbers.map((number) => {
      const citation = message.citations?.find((candidate) => candidate.number === number);
      if (!citation) return null;
      const isOpen =
        activeCitation?.messageId === message.id && activeCitation.number === number;
      return (
        <span className={styles.citationAnchor} key={`${language}-${number}`}>
          <button
            className={styles.citationButton}
            type="button"
            aria-expanded={isOpen}
            aria-label={`查看来源 ${number}`}
            onClick={(event) => {
              if (isOpen) {
                setActiveCitation(null);
                return;
              }
              const anchor = event.currentTarget.getBoundingClientRect();
              const viewportPadding = 12;
              const gap = 10;
              const popoverWidth = Math.min(300, window.innerWidth - viewportPadding * 2);
              const preferredRight = anchor.right + gap;
              const preferredLeft = anchor.left - gap - popoverWidth;
              const left =
                preferredRight + popoverWidth <= window.innerWidth - viewportPadding
                  ? preferredRight
                  : preferredLeft >= viewportPadding
                    ? preferredLeft
                    : Math.max(
                        viewportPadding,
                        Math.min(
                          anchor.left - popoverWidth / 2,
                          window.innerWidth - popoverWidth - viewportPadding,
                        ),
                      );
              const estimatedHeight = 170;
              const top = Math.max(
                viewportPadding,
                Math.min(
                  anchor.top - 18,
                  window.innerHeight - estimatedHeight - viewportPadding,
                ),
              );
              setActiveCitation({ messageId: message.id, number, top, left });
            }}
          >
            {number}
          </button>
        </span>
      );
    });
  }

  function renderCitationDetails(message: Message) {
    if (activeCitation?.messageId !== message.id) return null;
    const citation = message.citations?.find(
      (candidate) => candidate.number === activeCitation.number,
    );
    if (!citation) return null;
    return createPortal(
      <aside
        className={styles.citationPopover}
        role="dialog"
        style={{ top: activeCitation.top, left: activeCitation.left }}
      >
        <button
          className={styles.citationClose}
          type="button"
          aria-label="关闭来源"
          onClick={() => setActiveCitation(null)}
        >
          ×
        </button>
        <small>{locale === "zh" ? "信息摘要" : "SOURCE SUMMARY"}</small>
        <p>{citation.supportText || citation.excerpt || citation.title}</p>
        {citation.url ? (
          <a href={citation.url} target="_blank" rel="noreferrer">
            {locale === "zh" ? "查看资料来源 ↗" : "VIEW SOURCE ↗"}
          </a>
        ) : null}
      </aside>,
      document.body,
    );
  }

  return (
    <main className={`${styles.page} chat-prototype-page`}>
      <section
        className={styles.artworkPanel}
        aria-label="Artwork information"
        onWheel={zoomArtwork}
      >
        {selectedArtwork.imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={`${styles.artwork} ${
                artworkScale > 1 ? styles.artworkDraggable : ""
              } ${isDraggingArtwork ? styles.artworkDragging : ""}`}
              src={selectedArtwork.imageUrl}
              alt={`${selectedArtwork.artist}, ${selectedArtwork.title}`}
              draggable={false}
              onPointerDown={startArtworkDrag}
              onPointerMove={dragArtwork}
              onPointerUp={stopArtworkDrag}
              onPointerCancel={stopArtworkDrag}
              style={{
                transform: `translate3d(${artworkOffset.x}px, ${artworkOffset.y}px, 0) scale(${artworkScale})`,
                transformOrigin: `${artworkOrigin.x}% ${artworkOrigin.y}%`,
              }}
            />
          </>
        ) : (
          <div className={styles.artworkUnavailable} role="status">
            {locale === "zh" ? "该馆藏记录暂无可展示图像" : "No displayable image for this record"}
          </div>
        )}
        <div className={styles.artworkWash} />
        <Link
          className={styles.wordmark}
          href={`/${locale}`}
          aria-label={locale === "zh" ? "返回 Canvium 首页" : "Return to Canvium home"}
        >
          Canvium
        </Link>
        <CollectionBackLink
          className={styles.galleryExit}
          defaultHref={`/${locale}/museums/art-institute-of-chicago/collection`}
          label={
            locale === "zh"
              ? "退出作品对话，返回画廊"
              : "Exit the artwork conversation and return to the gallery"
          }
        >
          <span aria-hidden="true">←</span>
        </CollectionBackLink>
        <button
          className={styles.artworkReset}
          type="button"
          onClick={resetArtwork}
          disabled={artworkScale === 1}
          aria-label="将画作缩放复位到百分之百"
        >
          <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
        <ArtworkIdentity
          artist={selectedArtwork.artist}
          year={selectedArtwork.year}
          title={selectedArtwork.title.toUpperCase()}
          medium={selectedArtwork.medium.toUpperCase()}
          dimensions={selectedArtwork.dimensions.toUpperCase()}
          collection={selectedArtwork.collection.toUpperCase()}
        />
      </section>

      <section
        className={styles.chatPanel}
        aria-label={`Conversation about ${selectedArtwork.title} with ${selectedArtwork.artist}`}
      >
        <header className={styles.chatHeader}>
          <h1 className={styles.artistProfile}>
            <span className={styles.quotePair}>
              <span className={`${styles.inlineQuote} ${styles.openingQuote}`} aria-hidden="true">
                “
              </span>
              {artistProfile.name}
            </span>{" "}
            {artistProfile.localizedName !== artistProfile.name ? (
              <span className={styles.profileLine}>{artistProfile.localizedName} </span>
            ) : null}
            <span className={styles.profileLine}>
              Life: {artistProfile.life}, {artistProfile.country}{" "}
              {artistProfile.localizedCountry}{" "}
            </span>
            <span className={styles.profileLine}>
              Style: <BilingualTerms terms={artistProfile.style} />{" "}
            </span>
            <span className={styles.profileLine}>
              Subjects: <BilingualTerms terms={artistProfile.subjects} />{" "}
            </span>
            <span className={styles.profileLine}>
              Legacy: {artistProfile.legacy.english} {artistProfile.legacy.chinese}。
              <span className={`${styles.inlineQuote} ${styles.closingQuote}`} aria-hidden="true">
                ”
              </span>
            </span>
          </h1>
          {profileSources.length ? (
            <p className={styles.profileSources}>
              {locale === "zh" ? "资料来源：" : "Sources: "}
              {profileSources.map((source, index) => (
                <span key={source.url}>
                  {index > 0 ? " · " : null}
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.label}
                  </a>
                </span>
              ))}
            </p>
          ) : null}
        </header>

        <div className={styles.feed} ref={feedRef} aria-live="polite">
          {messages.map((message) => (
            <article
              className={`${styles.message} ${
                message.role === "question" ? styles.question : styles.answer
              }`}
              key={message.id}
            >
              <span className={styles.bracket} aria-hidden="true" />
              <div className={styles.messageBody}>
                {message.role === "answer" ? (
                  <>
                    {message.english ? (
                      <p className={styles.english}>
                        <b>A/</b>
                        {message.segments?.length
                          ? message.segments.map((segment, index) => (
                              <span key={`en-${index}`}>
                                {segment.english}
                                {renderCitations(message, segment.citationNumbers, "en")}
                                {index < message.segments!.length - 1 ? " " : null}
                              </span>
                            ))
                          : message.english}
                      </p>
                    ) : null}
                    <p className={styles.chinese}>
                      {message.segments?.length
                        ? message.segments.map((segment, index) => (
                            <span key={`zh-${index}`}>
                              {segment.chinese}
                              {renderCitations(message, segment.citationNumbers, "zh")}
                            </span>
                          ))
                        : message.chinese}
                    </p>
                    {message.responseType === "imagined_response" ? (
                      <span className={styles.responseLabel}>
                        {locale === "zh" ? "想象性回应" : "IMAGINED RESPONSE"}
                      </span>
                    ) : null}
                    {renderCitationDetails(message)}
                  </>
                ) : (
                  <>
                    <p className={styles.chinese}>
                      <b>Q/</b>
                      {message.chinese.replace(/[？?]\s*$/, "")}
                      <i>?</i>
                    </p>
                    {message.english ? <p className={styles.english}>{message.english}</p> : null}
                  </>
                )}
              </div>
            </article>
          ))}
          {isGenerating ? (
            <article
              className={`${styles.message} ${styles.answer} ${styles.generatingMessage}`}
              aria-live="polite"
              aria-label="AI 正在生成回答"
            >
              <span className={styles.bracket} aria-hidden="true" />
              <div className={styles.messageBody}>
                <p className={styles.generatingText}>
                  {locale === "zh" ? "正在回想" : "Remembering"}
                  <span className={styles.generatingDots} aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                </p>
              </div>
            </article>
          ) : null}
        </div>

        <div className={styles.composerArea}>
          <form
            className={`${styles.composer} ${
              isComposerExpanded || isListening || draft.trim() ? styles.composerExpanded : ""
            }`}
            onSubmit={submitQuestion}
            onMouseLeave={collapseEmptyComposer}
          >
            <span className={styles.inputBracket} aria-hidden="true" />
            <div className={styles.composerSurface}>
              {isListening ? (
                <div className={styles.listeningStage} aria-hidden="true">
                  <span className={styles.voiceWave}>
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </span>
                </div>
              ) : !isComposerExpanded && !draft.trim() ? (
                <button
                  className={styles.composerSeed}
                  type="button"
                  aria-label="展开文字输入框"
                  onClick={() => setIsComposerExpanded(true)}
                >
                  <span className={styles.seedArrow} aria-hidden="true">
                    <svg className={styles.actionIcon} focusable="false" viewBox="0 0 24 24">
                      <path d="M7 17 17 7" />
                      <path d="M8 7h9v9" />
                    </svg>
                  </span>
                  <span className={styles.seedVoice} aria-hidden="true">
                    <svg className={styles.actionIcon} focusable="false" viewBox="0 0 24 24">
                      <rect x="9" y="3" width="6" height="11" rx="3" />
                      <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
                      <path d="M12 17.5V21" />
                      <path d="M9 21h6" />
                    </svg>
                  </span>
                </button>
              ) : (
                <>
                  <label className="sr-only" htmlFor="chat-question">
                    {locale === "zh"
                      ? isVanGogh
                        ? "向梵高提问"
                        : `向${selectedArtwork.artist}提问`
                      : `Ask ${selectedArtwork.artist}`}
                  </label>
                  <input
                    ref={composerInputRef}
                    id="chat-question"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    disabled={isGenerating}
                    autoComplete="off"
                  />
                </>
              )}
              {isComposerExpanded || isListening || draft.trim() ? (
                <button
                  className={`${styles.composerAction} ${
                    isListening ? styles.listening : draft.trim() ? styles.readyToSend : ""
                  }`}
                  type="button"
                  aria-pressed={isListening}
                  aria-label={
                    isGenerating
                      ? "正在生成回答"
                      : isListening
                        ? "停止语音输入"
                        : draft.trim()
                          ? "发送消息"
                          : "开始语音输入"
                  }
                  onClick={handleComposerAction}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <span className={styles.generatingDot} aria-hidden="true" />
                  ) : isListening ? (
                    <span className={styles.stopIcon} aria-hidden="true" />
                  ) : draft.trim() ? (
                    <svg
                      className={styles.actionIcon}
                      aria-hidden="true"
                      focusable="false"
                      viewBox="0 0 24 24"
                    >
                      <path d="M7 17 17 7" />
                      <path d="M8 7h9v9" />
                    </svg>
                  ) : (
                    <svg
                      className={styles.actionIcon}
                      aria-hidden="true"
                      focusable="false"
                      viewBox="0 0 24 24"
                    >
                      <rect x="9" y="3" width="6" height="11" rx="3" />
                      <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
                      <path d="M12 17.5V21" />
                      <path d="M9 21h6" />
                    </svg>
                  )}
                </button>
              ) : null}
            </div>
            <span
              className={`${styles.inputBracket} ${styles.inputBracketRight}`}
              aria-hidden="true"
            />
          </form>
          {chatError ? (
            <p className={styles.chatError} role="alert">
              {chatError}
            </p>
          ) : null}
          <p className={styles.disclaimer}>AI 艺术家对话 · 回答基于馆藏资料与经审核的人格档案</p>
        </div>
      </section>
    </main>
  );
}
