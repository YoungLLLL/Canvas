import { copy } from "@/src/i18n/copy";
import type { Locale } from "@/src/i18n/locales";

export function RoutePlaceholder({
  locale,
  eyebrow,
  title,
  detail,
}: {
  locale: Locale;
  eyebrow: string;
  title: string;
  detail?: string;
}) {
  return (
    <main className="shell page">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="title">{title}</h1>
      <div className="status-card">
        <p>{detail ?? copy[locale].placeholder}</p>
      </div>
    </main>
  );
}
