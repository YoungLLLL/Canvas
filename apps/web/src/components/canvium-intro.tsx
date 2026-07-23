"use client";

import { useEffect, useState } from "react";

import { CanviumLoadingScreen } from "@/src/components/canvium-loading-screen";

const introSeenKey = "canvium:intro-seen";

export function CanviumIntro() {
  const [phase, setPhase] = useState<"visible" | "exiting" | "hidden">("visible");

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(introSeenKey) === "true") {
        const hideTimer = window.setTimeout(() => setPhase("hidden"), 0);
        return () => window.clearTimeout(hideTimer);
      }
      window.sessionStorage.setItem(introSeenKey, "true");
    } catch {
      // Storage can be unavailable in privacy-restricted browser contexts.
    }

    let active = true;
    const startedAt = performance.now();
    const minimumVisibleMs = 820;
    const maximumVisibleMs = 2200;

    const pageReady = new Promise<void>((resolve) => {
      if (document.readyState === "complete") {
        resolve();
        return;
      }
      window.addEventListener("load", () => resolve(), { once: true });
    });
    const fontsReady = document.fonts?.ready?.then(() => undefined) ?? Promise.resolve();
    const maximumWait = new Promise<void>((resolve) =>
      window.setTimeout(resolve, maximumVisibleMs),
    );

    void Promise.race([Promise.all([pageReady, fontsReady]), maximumWait]).then(() => {
      const remaining = Math.max(0, minimumVisibleMs - (performance.now() - startedAt));
      window.setTimeout(() => {
        if (!active) return;
        setPhase("exiting");
        window.setTimeout(() => {
          if (active) setPhase("hidden");
        }, 820);
      }, remaining);
    });

    return () => {
      active = false;
    };
  }, []);

  return phase === "hidden" ? null : <CanviumLoadingScreen exiting={phase === "exiting"} />;
}
