"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { navigateWithCurtain, signalRouteCurtainReady } from "@/src/components/route-curtain";
import type { Locale } from "@/src/i18n/locales";
import { createWheelBoundaryIntent } from "@/src/lib/wheel-boundary-intent";

export function CollectionRouteReady({ locale }: { locale: Locale }) {
  const router = useRouter();
  const transitioning = useRef(false);
  const museumHref = `/${locale}#museum`;

  const returnToMuseum = useCallback(() => {
    if (transitioning.current) return;
    transitioning.current = true;
    navigateWithCurtain({ href: museumHref, replace: true, scroll: false });
  }, [museumHref]);

  useEffect(() => {
    signalRouteCurtainReady();
  }, []);

  useEffect(() => {
    router.prefetch(`/${locale}`);
    const onWheel = createWheelBoundaryIntent({
      atBoundary: () => {
        const collection = document.querySelector<HTMLElement>("[data-floating-collection-root]");
        return (
          collection?.dataset.viewMode === "floating" &&
          collection.dataset.routeExitReady === "true"
        );
      },
      direction: "up",
      onIntent: returnToMuseum,
    });

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () => {
      window.removeEventListener("wheel", onWheel, { capture: true });
    };
  }, [locale, returnToMuseum, router]);

  return null;
}
