import Link from "next/link";
import { Suspense, ViewTransition } from "react";

import { CanviumIntro } from "@/src/components/canvium-intro";
import { LocaleSwitch } from "@/src/components/locale-switch";
import { RouteCurtain } from "@/src/components/route-curtain";
import { ShowcaseMotion } from "@/src/components/showcase-motion";
import type { Locale } from "@/src/i18n/locales";

const museumSlug = "art-institute-of-chicago";

export function SiteShell({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  return (
    <div lang={locale}>
      <CanviumIntro />
      <ShowcaseMotion />
      <RouteCurtain />
      <header className="site-header" id="siteHeader" style={{ viewTransitionName: "site-header" }}>
        <Link className="wordmark" href={`/${locale}`}>
          CANVIUM
        </Link>
        <nav className="nav" aria-label={locale === "zh" ? "主导航" : "Primary navigation"}>
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
        <div className="site-actions">
          <Suspense fallback={<span aria-hidden="true">{locale === "en" ? "ZH" : "EN"}</span>}>
            <LocaleSwitch locale={locale} />
          </Suspense>
          <Link className="search-pill" href={`/${locale}/museums/${museumSlug}/collection`}>
            <span>{locale === "zh" ? "搜索" : "Search"}</span>
            <small>{locale === "zh" ? "SEARCH" : "搜索"}</small>
            <b aria-hidden="true">↗</b>
          </Link>
        </div>
      </header>
      <ViewTransition default="none" enter="page-enter" exit="page-exit">
        {children}
      </ViewTransition>
    </div>
  );
}
