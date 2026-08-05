import { ViewTransition } from "react";

import { RouteCurtain } from "@/src/components/route-curtain";
import { ShowcaseMotion } from "@/src/components/showcase-motion";
import type { Locale } from "@/src/i18n/locales";

export function SiteShell({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  return (
    <div lang={locale}>
      <ShowcaseMotion />
      <RouteCurtain />
      <ViewTransition default="none" enter="page-enter" exit="page-exit">
        {children}
      </ViewTransition>
    </div>
  );
}
