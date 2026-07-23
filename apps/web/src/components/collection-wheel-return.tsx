"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import type { Locale } from "@/src/i18n/locales";
import { navigateWithCurtain, signalRouteCurtainReady } from "@/src/components/route-curtain";

export function CollectionWheelReturn({ locale }: { locale: Locale }) {
  const router = useRouter();
  const transitioning = useRef(false);
  const museumHref = `/${locale}#museum`;

  const returnToMuseum = useCallback(() => {
    if (transitioning.current) return;
    transitioning.current = true;

    navigateWithCurtain({ href: museumHref, replace: true });
  }, [museumHref]);

  useEffect(() => {
    signalRouteCurtainReady();
  }, []);

  useEffect(() => {
    router.prefetch(`/${locale}`);

    let wheelDelta = 0;
    let wheelReset = 0;

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.deltaY >= -1 || window.scrollY > 3) {
        if (event.deltaY > 0) wheelDelta = 0;
        return;
      }

      event.preventDefault();
      if (transitioning.current) return;

      wheelDelta += event.deltaY;
      window.clearTimeout(wheelReset);
      wheelReset = window.setTimeout(() => {
        wheelDelta = 0;
      }, 160);

      if (wheelDelta > -36) return;
      wheelDelta = 0;
      returnToMuseum();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.ctrlKey ||
        event.metaKey ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(
          (document.activeElement?.tagName ?? "").toUpperCase(),
        )
      ) {
        return;
      }
      if ((event.key === "ArrowUp" || event.key === "PageUp") && window.scrollY <= 3) {
        event.preventDefault();
        returnToMuseum();
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(wheelReset);
      document.documentElement.classList.remove("collection-transitioning");
    };
  }, [locale, returnToMuseum, router]);

  return null;
}
