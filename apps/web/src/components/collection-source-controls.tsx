import Link from "next/link";

import type { CatalogSource } from "@/src/lib/catalog-source";
import styles from "./collection-source-controls.module.css";

export function CollectionSourceControls({
  locale,
  source,
  query,
}: {
  locale: "en" | "zh";
  source: CatalogSource;
  query: string;
}) {
  return (
    <aside className={styles.controls} aria-label={locale === "zh" ? "馆藏来源" : "Catalog source"}>
      <Link
        className={`${styles.source} ${source === "artic" ? styles.active : ""}`}
        href={`/${locale}/museums/art-institute-of-chicago/collection`}
      >
        {locale === "zh" ? "芝加哥馆" : "Chicago"}
      </Link>
      <Link
        className={`${styles.source} ${source === "europeana" ? styles.active : ""}`}
        href={`/${locale}/museums/europeana/collection`}
      >
        {locale === "zh" ? "全球多馆藏" : "Multi-museum"}
      </Link>
      {source === "europeana" ? (
        <form className={styles.search} method="get">
          <input
            aria-label={
              locale === "zh" ? "搜索艺术馆、艺术家或作品" : "Search museums, artists or works"
            }
            defaultValue={query}
            name="q"
            placeholder={
              locale === "zh" ? "搜索 Rijksmuseum、Monet…" : "Search Rijksmuseum, Monet…"
            }
          />
          <button type="submit">{locale === "zh" ? "搜索" : "Search"}</button>
        </form>
      ) : null}
    </aside>
  );
}

export function EuropeanaSetupNotice({ locale }: { locale: "en" | "zh" }) {
  return (
    <section className={styles.notice}>
      <h1>{locale === "zh" ? "全球多馆藏尚未启用" : "Multi-museum catalog needs a key"}</h1>
      <p>
        {locale === "zh"
          ? "请在 apps/web/.env.local 中配置 EUROPEANA_API_KEY，然后重新启动开发服务器。配置完成后可按艺术馆、艺术家或作品名称搜索。"
          : "Set EUROPEANA_API_KEY in apps/web/.env.local and restart the development server. You can then search by museum, artist, or artwork."}
      </p>
      <a href="https://www.europeana.eu/en/apis" rel="noreferrer" target="_blank">
        {locale === "zh" ? "申请免费 API Key ↗" : "Request a free API key ↗"}
      </a>
    </section>
  );
}
