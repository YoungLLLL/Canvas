# Canvium Gallery Web

`apps/web` is the formal Next.js application introduced in Stage 4. The static prototype remains at
`../../experiments/canvas-demo` and is intentionally not imported or overwritten.

## Commands

```bash
npm run dev
npm run check
npm run build
npm run test:e2e
```

The browser test requires Playwright's Chromium binary (`npx playwright install chromium`).

## Boundaries

- `app/` owns stable routes, layouts, loading states, and error boundaries.
- `src/schemas/` owns Zod runtime contracts and inferred TypeScript types.
- `src/i18n/` owns the supported locale boundary (`zh`, `en`) and initial route copy.
- Stage 5 will add the ARTIC server adapter and replace route placeholders with live data.
