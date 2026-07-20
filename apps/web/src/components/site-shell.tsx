import Link from "next/link";

import { copy } from "@/src/i18n/copy";
import type { Locale } from "@/src/i18n/locales";

const museumSlug = "art-institute-of-chicago";

export function SiteShell({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  const text = copy[locale];
  const alternateLocale = locale === "en" ? "zh" : "en";

  return (
    <div lang={locale}>
      <header className="shell site-header">
        <Link className="wordmark" href={`/${locale}`}>
          Canvium
        </Link>
        <nav className="nav" aria-label="Primary navigation">
          <Link href={`/${locale}`}>{text.navHome}</Link>
          <Link href={`/${locale}/museums/${museumSlug}`}>{text.navMuseum}</Link>
          <Link href={`/${locale}/museums/${museumSlug}/collection`}>{text.navCollection}</Link>
          <Link href={`/${alternateLocale}`}>{alternateLocale.toUpperCase()}</Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
