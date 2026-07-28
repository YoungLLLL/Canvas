import type { ArtistProfile } from "@/src/components/chat-prototype";

const CURATED_ARTISTS =
  /van gogh|梵高|james peale|詹姆斯[·・]?皮尔|peter paul rubens|彼得[·・]?保罗[·・]?鲁本斯|[ée]douard manet|爱德华[·・]?马奈|jacob jordaens|雅各布[·・]?约尔丹斯|antonio (?:de )?puga|安东尼奥[·・]?普加|frans pourbus the younger|小弗兰斯[·・]?普布斯|luca cambiaso|卢卡[·・]?坎比亚索|apollonio di giovanni|阿波洛尼奥[·・]?迪[·・]?乔瓦尼|giovanni battista tiepolo|乔瓦尼[·・]?巴蒂斯塔[·・]?提埃波罗|artist unknown/i;

const movements = [
  ["Post-Impressionism", "后印象主义"],
  ["Impressionism", "印象主义"],
  ["Neoclassicism", "新古典主义"],
  ["Romanticism", "浪漫主义"],
  ["Mannerism", "矫饰主义"],
  ["Renaissance", "文艺复兴"],
  ["Realism", "现实主义"],
  ["Rococo", "洛可可"],
  ["Baroque", "巴洛克"],
  ["Cubism", "立体主义"],
  ["Surrealism", "超现实主义"],
  ["Fauvism", "野兽派"],
  ["Expressionism", "表现主义"],
  ["Modernism", "现代主义"],
] as const;

const subjectTerms = [
  ["portrait", "Portraits", "肖像"],
  ["landscape", "Landscapes", "风景"],
  ["still life", "Still Life", "静物"],
  ["flower", "Flowers", "花卉"],
  ["modern life", "Modern Life", "现代生活"],
  ["religious", "Religious Scenes", "宗教题材"],
  ["mytholog", "Mythology", "神话"],
  ["history painting", "History Painting", "历史画"],
  ["genre scene", "Genre Scenes", "风俗场景"],
  ["seascape", "Seascapes", "海景"],
] as const;

type WikiPage = {
  title?: string;
  extract?: string;
  langlinks?: Array<{ "*"?: string }>;
  categories?: Array<{ title?: string }>;
};

type WikiResponse = {
  query?: { pages?: Record<string, WikiPage> };
};

function artistName(artist: string) {
  return artist.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

function artistDetails(artist: string) {
  return artist.match(/\(([^)]*)\)\s*$/)?.[1] || "";
}

function ordinal(value: number) {
  const remainder = value % 100;
  if (remainder >= 11 && remainder <= 13) return `${value}th`;
  if (value % 10 === 1) return `${value}st`;
  if (value % 10 === 2) return `${value}nd`;
  if (value % 10 === 3) return `${value}rd`;
  return `${value}th`;
}

const localizedCountries: Record<string, string> = {
  american: "美国",
  austrian: "奥地利",
  belgian: "比利时",
  british: "英国",
  dutch: "荷兰",
  english: "英国",
  flemish: "佛兰德斯",
  french: "法国",
  german: "德国",
  italian: "意大利",
  spanish: "西班牙",
  swiss: "瑞士",
};

async function wikipediaIntro(language: "en" | "zh", title: string) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    redirects: "1",
    prop: language === "en" ? "extracts|langlinks|categories" : "extracts",
    exintro: "1",
    explaintext: "1",
    titles: title,
  });
  if (language === "en") {
    params.set("lllang", "zh");
    params.set("cllimit", "max");
  }
  const response = await fetch(`https://${language}.wikipedia.org/w/api.php?${params}`, {
    headers: {
      "User-Agent": "Canvium/1.0 (artist profile lookup)",
    },
    next: { revalidate: 604800 },
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as WikiResponse;
  return Object.values(payload.query?.pages || {})[0] || null;
}

export async function getWikipediaArtistProfile(artist: string): Promise<ArtistProfile | null> {
  if (CURATED_ARTISTS.test(artist)) return null;
  const name = artistName(artist);
  try {
    const english = await wikipediaIntro("en", name);
    if (!english?.extract || english.title === undefined) return null;
    const chineseTitle = english.langlinks?.[0]?.["*"];
    const chinese = chineseTitle ? await wikipediaIntro("zh", chineseTitle) : null;
    const englishExtract = english.extract;
    const details = artistDetails(artist);
    const life = details.match(/\b\d{4}(?:\/\d{2})?\s*[–-]\s*\d{4}\b/)?.[0] || "See biography";
    const country = details.split(",")[0]?.trim() || "See biography";
    const birthYear = Number(life.match(/\d{4}/)?.[0]);
    const century = Number.isFinite(birthYear) ? Math.floor((birthYear - 1) / 100) + 1 : null;
    const localizedCountry = localizedCountries[country.toLowerCase()] || "详见人物资料";
    const searchableBiography = `${englishExtract} ${(english.categories || [])
      .map(({ title }) => title || "")
      .join(" ")}`;

    const detectedStyle = movements
      .filter(([label]) => new RegExp(`\\b${label}\\b`, "i").test(searchableBiography))
      .slice(0, 3)
      .map(([englishLabel, chineseLabel]) => ({
        english: englishLabel,
        chinese: chineseLabel,
      }));
    const style =
      detectedStyle.length > 0
        ? detectedStyle
        : [
            {
              english: century
                ? `${ordinal(century)}-Century ${country} Painting`
                : `${country} Painting`,
              chinese: century
                ? `${century}世纪${localizedCountry}绘画`
                : `${localizedCountry}绘画`,
            },
          ];
    const detectedSubjects = subjectTerms
      .filter(([needle]) => englishExtract.toLowerCase().includes(needle))
      .slice(0, 3)
      .map(([, englishLabel, chineseLabel]) => ({
        english: englishLabel,
        chinese: chineseLabel,
      }));
    const subjects =
      detectedSubjects.length > 0
        ? detectedSubjects
        : /lithograph|printmaker|draughtsman|drawing|works on paper/i.test(englishExtract)
          ? [{ english: "Painting and Works on Paper", chinese: "绘画与纸上作品" }]
          : [{ english: "Painting", chinese: "绘画" }];

    const subjectSummaryEnglish = subjects.map(({ english }) => english.toLowerCase()).join(", ");
    const subjectSummaryChinese = subjects.map(({ chinese }) => chinese).join("、");
    const styleSummaryEnglish = style.map(({ english }) => english).join(", ");
    const styleSummaryChinese = style.map(({ chinese }) => chinese).join("、");
    const legacyEnglish = `Recognized for ${subjectSummaryEnglish} within ${styleSummaryEnglish}.`;
    const legacyChinese = `以${subjectSummaryChinese}创作为人所知，作品体现${styleSummaryChinese}特征`;

    return {
      name: english.title || name,
      localizedName: chinese?.title || name,
      life,
      country,
      localizedCountry,
      style,
      subjects,
      legacy: { english: legacyEnglish, chinese: legacyChinese },
      sources: [
        {
          label: "Wikipedia",
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(
            (english.title || name).replaceAll(" ", "_"),
          )}`,
        },
      ],
    };
  } catch {
    return null;
  }
}
