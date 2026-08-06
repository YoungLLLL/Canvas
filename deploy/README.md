# Canvium Gallery Web — Deployment Copy

This folder is the standalone production deployment copy. It intentionally excludes the
repository's historical prototypes, experiments, evaluation artifacts, tests, logs, and caches.

From this folder:

```bash
npm ci
npm run build
npm run start
```

Configure the variables in `.env.example` through the hosting provider's environment settings.
Never commit `.env.local` or API keys.

---

`apps/web` is the formal Next.js application introduced in Stage 4. Stage 5 connects its collection
and artwork routes to live Art Institute of Chicago records. The static prototype remains at
`../../experiments/canvas-demo` as a visual reference and is intentionally not overwritten.

## Commands

```bash
npm run dev
npm run check
npm run build
npm run test:e2e
```

The browser test requires Playwright's Chromium binary (`npx playwright install chromium`).

Copy `.env.example` to `.env.local` and replace the placeholder contact address before production
deployment. ARTIC requests are cached for five minutes, retried once for transient failures, and may
fall back to a successful response for up to one hour when the upstream service is unstable.

## Boundaries

- `app/` owns stable routes, layouts, loading states, and error boundaries.
- `src/schemas/` owns Zod runtime contracts and inferred TypeScript types.
- `src/i18n/` owns the supported locale boundary (`zh`, `en`) and initial route copy.
- `src/lib/artic.ts` owns the ARTIC query allowlist, normalization, rights eligibility, pagination,
  retry, and short-term cache behavior.
- Collection queries are canonical shareable URLs and cannot browse beyond ARTIC's documented
  10,000-result search window.
- Museum images are hotlinked from ARTIC's IIIF service. Responsive sizes, LQIP previews, and an
  explicit failure state keep a single image failure from breaking a collection page.
