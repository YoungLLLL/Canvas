"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ComponentProps, useEffect } from "react";

const STORAGE_KEY = "canvium:collection-return";

type ReturnState = {
  artworkKey: string;
  collectionUrl: string;
  scrollY: number;
};

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
  const searchParams = useSearchParams();

  return (
    <Link
      {...linkProps}
      className={["artwork-card", className].filter(Boolean).join(" ")}
      href={`/${pathname.split("/")[1]}/artworks/${artworkKey}`}
      id={`card-${artworkKey}${idSuffix}`}
      onClick={(event) => {
        const query = searchParams.toString();
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            artworkKey,
            collectionUrl: `${pathname}${query ? `?${query}` : ""}`,
            scrollY: window.scrollY,
          } satisfies ReturnState),
        );
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
    const state = readState();
    const query = searchParams.toString();
    if (!state || state.collectionUrl !== `${pathname}${query ? `?${query}` : ""}`) return;
    const card = document.getElementById(`card-${state.artworkKey}`);
    requestAnimationFrame(() => {
      window.scrollTo({ top: state.scrollY, behavior: "auto" });
      card?.focus({ preventScroll: true });
    });
  }, [pathname, searchParams]);

  return null;
}

export function CollectionBackLink({ defaultHref, label }: { defaultHref: string; label: string }) {
  const router = useRouter();
  return (
    <button
      aria-label={label}
      className="detail-back"
      onClick={() => {
        const state = readState();
        router.push(state?.collectionUrl ?? defaultHref, { scroll: false });
      }}
      type="button"
    >
      ×
    </button>
  );
}
