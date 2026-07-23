"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const routeCurtainEvent = "canvium:route-curtain";
const routeCurtainReadyEvent = "canvium:route-curtain-ready";

type RouteCurtainDetail = {
  href: string;
  replace?: boolean;
};

export function navigateWithCurtain(detail: RouteCurtainDetail) {
  window.dispatchEvent(new CustomEvent<RouteCurtainDetail>(routeCurtainEvent, { detail }));
}

export function signalRouteCurtainReady() {
  window.dispatchEvent(new Event(routeCurtainReadyEvent));
}

export function RouteCurtain() {
  const router = useRouter();
  const curtainRef = useRef<HTMLDivElement>(null);
  const transitioning = useRef(false);
  const navigationStarted = useRef(false);

  useEffect(() => {
    const curtain = curtainRef.current;
    if (!curtain) return;

    let navigationTimer = 0;
    let fallbackTimer = 0;
    let revealTimer = 0;

    const onNavigate = (event: Event) => {
      if (transitioning.current) return;
      const { href, replace = false } = (event as CustomEvent<RouteCurtainDetail>).detail;
      if (!href) return;

      transitioning.current = true;
      navigationStarted.current = false;
      document.documentElement.classList.add("collection-transitioning");
      curtain.classList.remove("revealing");
      curtain.classList.add("covering");

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      navigationTimer = window.setTimeout(
        () => {
          navigationStarted.current = true;
          if (replace) router.replace(href);
          else router.push(href);
        },
        reducedMotion ? 20 : 660,
      );

      fallbackTimer = window.setTimeout(() => {
        curtain.classList.remove("covering", "revealing");
        document.documentElement.classList.remove("collection-transitioning");
        transitioning.current = false;
        navigationStarted.current = false;
      }, 8000);
    };

    const onReady = () => {
      if (!transitioning.current || !navigationStarted.current) return;
      curtain.classList.remove("covering");
      curtain.classList.add("revealing");
      revealTimer = window.setTimeout(() => {
        curtain.classList.remove("revealing");
        document.documentElement.classList.remove("collection-transitioning");
        transitioning.current = false;
        navigationStarted.current = false;
      }, 620);
    };

    window.addEventListener(routeCurtainEvent, onNavigate);
    window.addEventListener(routeCurtainReadyEvent, onReady);
    return () => {
      window.removeEventListener(routeCurtainEvent, onNavigate);
      window.removeEventListener(routeCurtainReadyEvent, onReady);
      window.clearTimeout(navigationTimer);
      window.clearTimeout(fallbackTimer);
      window.clearTimeout(revealTimer);
      document.documentElement.classList.remove("collection-transitioning");
    };
  }, [router]);

  return (
    <div
      className="route-transition-curtain"
      ref={curtainRef}
      role="status"
      aria-live="polite"
      aria-label="Loading the next gallery view"
    >
      <svg
        className="curtain-shape"
        viewBox="0 0 100 122"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 0 Q50 22 100 0 V122 H0 Z" />
      </svg>
      <span>CANVIUM</span>
    </div>
  );
}
