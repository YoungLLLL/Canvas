import Link from "next/link";
import { ViewTransition } from "react";

import { ShowcaseMotion } from "@/src/components/showcase-motion";
import type { Locale } from "@/src/i18n/locales";

const museumSlug = "art-institute-of-chicago";

export function SiteShell({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  return (
    <div lang={locale}>
      <ShowcaseMotion />
      <header className="site-header" id="siteHeader" style={{ viewTransitionName: "site-header" }}>
        <Link className="wordmark" href={`/${locale}`}>
          CANVIUM
        </Link>
        <nav aria-label={locale === "zh" ? "主导航" : "Primary navigation"}>
          <Link href={`/${locale}`}>
            <span>{locale === "zh" ? "每日艺术" : "Daily Art"}</span>
            <small>DAILY ART</small>
          </Link>
          <Link href={`/${locale}#museum`}>
            <span>{locale === "zh" ? "博物馆" : "Museums"}</span>
            <small>MUSEUMS</small>
          </Link>
          <Link href={`/${locale}/artists/van-gogh`}>
            <span>{locale === "zh" ? "艺术家" : "Artists"}</span>
            <small>ARTISTS</small>
          </Link>
        </nav>
        <Link className="search-pill" href={`/${locale}/museums/${museumSlug}/collection`}>
          {locale === "zh" ? "搜索" : "Search"} <span>↗</span>
        </Link>
      </header>
      <ViewTransition default="none" enter="page-enter" exit="page-exit">
        {children}
      </ViewTransition>
    </div>
  );
}
