"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ArtworkCardLink } from "@/src/components/collection-state";
import { iiifImageUrl } from "@/src/lib/iiif";
import { catalogPageSchema, type Artwork, type CatalogPage } from "@/src/schemas/catalog";

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

function titleInChinese(artwork: Artwork) {
  const wikidataTitle = artwork.display.localizedTitles.zh?.trim();
  if (wikidataTitle && /[\u3400-\u9fff]/u.test(wikidataTitle)) return wikidataTitle;
  const alternate = artwork.display.altTitles.find((title) => /[\u3400-\u9fff]/u.test(title));
  if (alternate) return alternate;
  const englishTitles = [artwork.display.localizedTitles.en, artwork.display.title]
    .filter((title) => title !== undefined)
    .map((title) => title.trim().toLocaleLowerCase("en"));
  const exact =
    CURATED_ZH_TITLES[artwork.sourceId] ??
    englishTitles.map((title) => CURATED_ZH_TITLES[title]).find(Boolean);
  if (exact) return exact;
  const partial = Object.entries(CURATED_ZH_TITLES).find(
    ([title]) =>
      !/^\d+$/u.test(title) &&
      englishTitles.some((englishTitle) => englishTitle.startsWith(`${title},`)),
  );
  return partial?.[1] ?? "中文译名待核";
}

function imageFor(artwork: Artwork) {
  const image = artwork.images.preferred;
  if (!image) return null;
  return {
    src: image.directUrl || iiifImageUrl(image, 843),
    srcSet: image.directUrl2x ? `${image.directUrl} 1x, ${image.directUrl2x} 2x` : undefined,
    ratio: image.width && image.height ? image.width / image.height : 0.78,
    alt: image.altText || `${artwork.display.artistDisplay}, ${artwork.display.title}`,
  };
}

export function CollectionInfiniteGrid({
  initialPage,
  locale,
}: {
  initialPage: CatalogPage;
  locale: "en" | "zh";
}) {
  const [artworks, setArtworks] = useState(initialPage.items);
  const [hasNextPage, setHasNextPage] = useState(initialPage.pageInfo.hasNextPage);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "error">("idle");
  const nextPageRef = useRef(2);
  const requestInFlight = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadNextPage = useCallback(async () => {
    if (!hasNextPage || requestInFlight.current) return;
    requestInFlight.current = true;
    setLoadState("loading");
    try {
      const response = await fetch(`/api/catalog?page=${nextPageRef.current}`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`catalog page failed with ${response.status}`);
      const nextPage = catalogPageSchema.parse(await response.json());
      nextPageRef.current += 1;
      setArtworks((current) => {
        const known = new Set(current.map((artwork) => artwork.sourceId));
        return [...current, ...nextPage.items.filter((artwork) => !known.has(artwork.sourceId))];
      });
      setHasNextPage(nextPage.pageInfo.hasNextPage);
      setLoadState("idle");
    } catch (error) {
      console.error(error);
      setLoadState("error");
    } finally {
      requestInFlight.current = false;
    }
  }, [hasNextPage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadNextPage();
      },
      { rootMargin: "900px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, loadNextPage]);

  const cards = useMemo(
    () =>
      artworks.map((artwork, index) => {
        const image = imageFor(artwork);
        const englishTitle = artwork.display.localizedTitles.en || artwork.display.title;
        return (
          <ArtworkCardLink
            artworkKey={`artic-${artwork.sourceId}`}
            className={`collection-result-card${image ? "" : " is-metadata-only"}`}
            key={artwork.sourceId}
            style={
              {
                "--result-ratio": Math.min(1.9, Math.max(0.65, image?.ratio ?? 0.78)),
              } as React.CSSProperties
            }
          >
            <figure>
              {image ? (
                <img
                  alt={image.alt}
                  decoding="async"
                  fetchPriority={index < 3 ? "high" : "auto"}
                  loading={index < 3 ? "eager" : "lazy"}
                  src={image.src}
                  srcSet={image.srcSet}
                />
              ) : (
                <span className="collection-result-placeholder">
                  <small>{locale === "zh" ? "仅资料记录" : "Metadata-only record"}</small>
                  <strong>{titleInChinese(artwork)}</strong>
                </span>
              )}
              <span className="collection-result-open">
                <span>{locale === "zh" ? "进入作品" : "Open artwork"}</span>
                <small>{locale === "zh" ? "OPEN ARTWORK" : "进入作品"}</small> ↗
              </span>
            </figure>
            <div className="collection-result-copy">
              <h3>{titleInChinese(artwork)}</h3>
              <h4>{englishTitle}</h4>
              <p>{artwork.display.artistDisplay}</p>
              <span>
                {artwork.display.dateDisplay || (locale === "zh" ? "年代不详" : "Date unknown")}
              </span>
            </div>
          </ArtworkCardLink>
        );
      }),
    [artworks, locale],
  );

  return (
    <>
      <div
        className="collection-results-grid"
        aria-label={locale === "zh" ? "馆藏作品列表" : "Collection artworks"}
      >
        {cards}
      </div>
      <div className="collection-load-sentinel" ref={sentinelRef}>
        {loadState === "loading" ? (
          <p aria-live="polite">
            <span>{locale === "zh" ? "正在加载更多作品" : "Loading more artworks"}</span>
            <small>{locale === "zh" ? "LOADING MORE ARTWORKS" : "正在加载更多作品"}</small>
          </p>
        ) : null}
        {loadState === "error" ? (
          <button onClick={() => void loadNextPage()} type="button">
            {locale === "zh" ? "加载失败，点击重试" : "Could not load more — retry"}
          </button>
        ) : null}
        {!hasNextPage ? (
          <p>
            <span>{locale === "zh" ? "已浏览全部开放作品" : "All available works loaded"}</span>
            <small>{locale === "zh" ? "END OF COLLECTION" : "馆藏已全部加载"}</small>
          </p>
        ) : null}
      </div>
    </>
  );
}
