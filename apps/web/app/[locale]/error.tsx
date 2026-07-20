"use client";

import { useEffect } from "react";

export default function LocaleError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => console.error(error), [error]);

  return (
    <main className="shell page">
      <p className="eyebrow">Error</p>
      <h1 className="title">This part of the gallery could not be opened.</h1>
      <div className="actions">
        <button className="button button-primary" onClick={() => unstable_retry()} type="button">
          Try again
        </button>
      </div>
    </main>
  );
}
