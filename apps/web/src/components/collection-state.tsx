"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ComponentProps, useEffect } from "react";

const STORAGE_KEY = "canvium:collection-return";
const RESTORE_REQUEST_KEY = "canvium:collection-restore-request";

type ReturnState = {
  artworkKey: string;
  collectionUrl: string;
  scrollY: number;
};

export function saveCollectionReturnState(artworkKey: string) {
  const collectionUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ artworkKey, collectionUrl, scrollY: window.scrollY } satisfies ReturnState),
  );
}

function readState(): ReturnState | null {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null") as ReturnState | null;
    return parsed?.collectionUrl.startsWith("/") ? parsed : null;
  } catch {
    return null;
  }
}

export function ArtworkCardLink({
  artworkKey,
  idSuffix = "",
  children,
  className,
  onClick,
  ...linkProps
}: Omit<ComponentProps<typeof Link>, "href" | "id"> & {
  artworkKey: string;
  idSuffix?: string;
}) {
  const pathname = usePathname();

  return (
    <Link
      {...linkProps}
      className={["artwork-card", className].filter(Boolean).join(" ")}
      href={`/${pathname.split("/")[1]}/artworks/${artworkKey}`}
      id={`card-${artworkKey}${idSuffix}`}
      onClick={(event) => {
        saveCollectionReturnState(artworkKey);
        onClick?.(event);
      }}
    >
      {children}
    </Link>
  );
}

export function CollectionStateRestorer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (sessionStorage.getItem(RESTORE_REQUEST_KEY) !== "1") return;
    sessionStorage.removeItem(RESTORE_REQUEST_KEY);
    const state = readState();
    const query = searchParams.toString();
    if (!state) return;
    const savedUrl = new URL(state.collectionUrl, window.location.origin);
    const currentUrl = `${pathname}${query ? `?${query}` : ""}`;
    if (`${savedUrl.pathname}${savedUrl.search}` !== currentUrl) return;
    const restore = () => {
      const card = document.getElementById(`card-${state.artworkKey}`);
      window.scrollTo({ top: state.scrollY, behavior: "auto" });
      card?.focus({ preventScroll: true });
      return Boolean(card);
    };
    const frame = requestAnimationFrame(restore);
    const timers = [80, 280, 600].map((delay) => window.setTimeout(restore, delay));
    const observer = new MutationObserver(() => {
      if (restore()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(frame);
      timers.forEach((timer) => window.clearTimeout(timer));
      observer.disconnect();
    };
  }, [pathname, searchParams]);

  return null;
}

export function CollectionBackLink({
  children,
  className = "detail-back",
  defaultHref,
  label,
}: {
  children?: React.ReactNode;
  className?: string;
  defaultHref: string;
  label: string;
}) {
  const router = useRouter();
  return (
    <button
      aria-label={label}
      className={className}
      onClick={() => {
        const state = readState();
        const destination = state?.collectionUrl ?? defaultHref;
        if (state) sessionStorage.setItem(RESTORE_REQUEST_KEY, "1");
        router.push(destination, { scroll: false });
        if (!state) return;
        const savedPath = new URL(state.collectionUrl, window.location.origin).pathname;
        let attempts = 0;
        const restoreAfterNavigation = () => {
          attempts += 1;
          if (window.location.pathname !== savedPath) {
            if (attempts < 40) window.setTimeout(restoreAfterNavigation, 50);
            return;
          }
          const card = document.getElementById(`card-${state.artworkKey}`);
          if (!card) {
            if (attempts < 40) window.setTimeout(restoreAfterNavigation, 50);
            return;
          }
          const restore = () => {
            window.scrollTo({ top: state.scrollY, behavior: "auto" });
            card.focus({ preventScroll: true });
          };
          restore();
          window.setTimeout(restore, 160);
          window.setTimeout(restore, 480);
        };
        window.setTimeout(restoreAfterNavigation, 0);
      }}
      type="button"
    >
      {children ?? "×"}
    </button>
  );
}
