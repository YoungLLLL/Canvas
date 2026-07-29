import { SEEDED_ARTWORK_TITLE_TRANSLATIONS } from "../data/artwork-title-translations.zh-Hans.ts";

type ArtworkTitleInput = {
  sourceId: string;
  display: {
    title: string;
    localizedTitles: Record<string, string>;
    localizedTitleMetadata?: Record<
      string,
      {
        source: "museum" | "wikidata" | "alternate" | "curated" | "machine";
        status: "verified" | "provisional";
      }
    >;
    altTitles: string[];
  };
};

export type ResolvedArtworkTitle = {
  text: string;
  source: "curated" | "wikidata" | "alternate" | "provisional" | "english";
  status: "verified" | "provisional" | "unavailable";
  hasChinese: boolean;
};

const CURATED_ZH_TITLES: Record<string, string> = {
  "28560": "卧室",
  "80607": "自画像",
  "14586": "诗人的花园",
  "water lilies": "睡莲",
  "fish (still life)": "鱼（静物）",
  "nocturne: blue and gold—southampton water": "蓝与金的夜曲：南安普顿水域",
  "the artist in his studio": "画室中的艺术家",
  "sawmill, outskirts of paris": "巴黎郊外的锯木厂",
  "the crucifixion": "基督受难",
  "lunch at the restaurant fournaise": "富尔奈斯餐厅的午餐",
  "susanna and the elders": "苏珊娜与长老",
  "daniel saving susanna, the judgment of daniel": "但以理拯救苏珊娜",
  "scenes from the life of saint john the baptist": "施洗者圣约翰生平场景",
  "virgin and child with two angels": "圣母子与两位天使",
  "the holy family with saint elizabeth and saint john": "圣家族与圣伊丽莎白、圣约翰",
  "saint francis": "圣方济各",
  "temptation of mary magdalen": "抹大拉的马利亚受诱惑",
  "marie de médici": "玛丽·德·美第奇",
  "woman in a straw hat": "戴草帽的女子",
  "man in armour": "身着盔甲的男子",
  "venus and cupid": "维纳斯与丘比特",
  "the adventures of ulysses": "尤利西斯历险记",
  "virgin and child with saints dominic and hyacinth": "圣母子与圣多明我、圣雅钦多",
  "olivia simes morris": "奥利维娅·赛姆斯·莫里斯",
  "baskets with flowers of the four seasons": "四季花篮",
  "sketch for the revolt of cairo": "《开罗起义》草图",
  "mater dolorosa (sorrowing virgin)": "悲伤圣母",
  "woman in a blue dress": "蓝裙女子",
  "tantric temple banner of a dancing goddess flanked by dakinis": "坦陀罗神庙幡：舞蹈女神与空行母",
  "el maragato threatens friar pedro de zaldivia with his gun":
    "埃尔·马拉加托持枪威胁佩德罗·德·萨尔迪维亚修士",
  "terrace and observation deck at the moulin de blute-fin, montmartre":
    "蒙马特布吕特-凡磨坊的露台与观景台",
};

// These are useful, readable candidates for records that currently have no sourced Chinese label.
// Keeping them separate prevents a provisional translation from being presented as museum metadata.
const PROVISIONAL_ZH_TITLES: Record<string, string> = {
  "86782": "女子肖像",
  "111614": "男子肖像",
  "100476": "卡巴松海滩（浴场）",
};

const CHINESE_LOCALES = ["zh-Hans", "zh-CN", "zh-SG", "zh"] as const;

export function containsChinese(value: string | undefined): value is string {
  return Boolean(value && /[\u3400-\u9fff]/u.test(value));
}

export function resolveChineseArtworkTitle(artwork: ArtworkTitleInput): ResolvedArtworkTitle {
  const curatedById = CURATED_ZH_TITLES[artwork.sourceId];
  if (curatedById) {
    return { text: curatedById, source: "curated", status: "verified", hasChinese: true };
  }

  for (const locale of CHINESE_LOCALES) {
    const value = artwork.display.localizedTitles[locale]?.trim();
    if (containsChinese(value)) {
      const metadata = artwork.display.localizedTitleMetadata?.[locale];
      const provisional = metadata?.status === "provisional";
      return {
        text: value,
        source: provisional ? "provisional" : "wikidata",
        status: provisional ? "provisional" : "verified",
        hasChinese: true,
      };
    }
  }

  const alternate = artwork.display.altTitles.find(containsChinese);
  if (alternate) {
    return { text: alternate, source: "alternate", status: "verified", hasChinese: true };
  }

  const englishTitles = [artwork.display.localizedTitles.en, artwork.display.title]
    .filter((title): title is string => Boolean(title))
    .map((title) => title.trim().toLocaleLowerCase("en"));
  const curatedByTitle = englishTitles.map((title) => CURATED_ZH_TITLES[title]).find(Boolean);
  if (curatedByTitle) {
    return { text: curatedByTitle, source: "curated", status: "verified", hasChinese: true };
  }
  const partial = Object.entries(CURATED_ZH_TITLES).find(
    ([title]) =>
      !/^\d+$/u.test(title) &&
      englishTitles.some((englishTitle) => englishTitle.startsWith(`${title},`)),
  );
  if (partial) {
    return { text: partial[1], source: "curated", status: "verified", hasChinese: true };
  }

  const englishTitle = artwork.display.localizedTitles.en || artwork.display.title;
  const seeded = (
    SEEDED_ARTWORK_TITLE_TRANSLATIONS as Record<string, { sourceTitle: string; zhHans: string }>
  )[artwork.sourceId];
  const provisional =
    (seeded?.sourceTitle === englishTitle ? seeded.zhHans : undefined) ||
    PROVISIONAL_ZH_TITLES[artwork.sourceId];
  if (provisional) {
    return {
      text: provisional,
      source: "provisional",
      status: "provisional",
      hasChinese: true,
    };
  }

  return {
    text: artwork.display.localizedTitles.en || artwork.display.title,
    source: "english",
    status: "unavailable",
    hasChinese: false,
  };
}
