"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const routeCurtainEvent = "canvium:route-curtain";
const routeCurtainReadyEvent = "canvium:route-curtain-ready";
const minimumCoverDuration = 980;
const navigationLeadIn = 120;

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
  const pathname = usePathname();
  const curtainRef = useRef<HTMLDivElement>(null);
  const transitioning = useRef(false);
  const navigationStarted = useRef(false);
  const transitionStartedAt = useRef(0);
  const observedPathname = useRef(pathname);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const curtain = curtainRef.current;
    if (!curtain) return;

    let navigationTimer = 0;
    let fallbackTimer = 0;
    let revealTimer = 0;
    let progressTimer = 0;
    const zh = window.location.pathname === "/zh" || window.location.pathname.startsWith("/zh/");
    const copy = zh
      ? {
          preparing: "正在开启数字馆藏",
          connecting: "正在连接馆藏资料",
          arranging: "正在布置作品与图像",
          ready: "馆藏已准备完成",
        }
      : {
          preparing: "Opening the digital collection",
          connecting: "Connecting collection records",
          arranging: "Arranging artworks and images",
          ready: "The collection is ready",
        };

    const clearProgressTimer = () => {
      window.clearInterval(progressTimer);
      progressTimer = 0;
    };

    const onNavigate = (event: Event) => {
      if (transitioning.current) return;
      const { href, replace = false } = (event as CustomEvent<RouteCurtainDetail>).detail;
      if (!href) return;

      transitioning.current = true;
      navigationStarted.current = false;
      transitionStartedAt.current = performance.now();
      setProgress(6);
      setStatus(copy.preparing);
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
        reducedMotion ? 20 : navigationLeadIn,
      );

      progressTimer = window.setInterval(() => {
        const elapsed = performance.now() - transitionStartedAt.current;
        const nextProgress =
          elapsed < minimumCoverDuration
            ? 6 + (elapsed / minimumCoverDuration) * 46
            : 52 + (1 - Math.exp(-(elapsed - minimumCoverDuration) / 3000)) * 42;
        setProgress(Math.min(94, Math.round(nextProgress)));
        setStatus(
          elapsed < minimumCoverDuration
            ? copy.preparing
            : elapsed < 4200
              ? copy.connecting
              : copy.arranging,
        );
      }, 160);

      fallbackTimer = window.setTimeout(() => {
        clearProgressTimer();
        curtain.classList.remove("covering", "revealing");
        document.documentElement.classList.remove("collection-transitioning");
        transitioning.current = false;
        navigationStarted.current = false;
        setProgress(0);
        setStatus("");
      }, 20_000);
    };

    const onReady = () => {
      if (!transitioning.current || !navigationStarted.current) return;
      clearProgressTimer();
      window.clearTimeout(fallbackTimer);
      setProgress(100);
      setStatus(copy.ready);

      const elapsed = performance.now() - transitionStartedAt.current;
      const revealDelay = Math.max(180, minimumCoverDuration - elapsed);
      revealTimer = window.setTimeout(() => {
        curtain.classList.remove("covering");
        curtain.classList.add("revealing");
        revealTimer = window.setTimeout(() => {
          curtain.classList.remove("revealing");
          document.documentElement.classList.remove("collection-transitioning");
          transitioning.current = false;
          navigationStarted.current = false;
          setProgress(0);
          setStatus("");
        }, 820);
      }, revealDelay);
    };

    window.addEventListener(routeCurtainEvent, onNavigate);
    window.addEventListener(routeCurtainReadyEvent, onReady);
    if (curtain.classList.contains("covering")) {
      transitioning.current = true;
      navigationStarted.current = true;
      transitionStartedAt.current ||= performance.now() - minimumCoverDuration;
      document.documentElement.classList.add("collection-transitioning");
      revealTimer = window.setTimeout(onReady, 0);
    }
    return () => {
      window.removeEventListener(routeCurtainEvent, onNavigate);
      window.removeEventListener(routeCurtainReadyEvent, onReady);
      window.clearTimeout(navigationTimer);
      window.clearTimeout(fallbackTimer);
      window.clearTimeout(revealTimer);
      clearProgressTimer();
      document.documentElement.classList.remove("collection-transitioning");
    };
  }, [router]);

  useEffect(() => {
    if (observedPathname.current === pathname) return;
    observedPathname.current = pathname;
    window.dispatchEvent(new Event(routeCurtainReadyEvent));
  }, [pathname]);

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
      <span className="route-curtain-title">CANVIUM</span>
      <div
        className="route-curtain-loading"
        role="progressbar"
        aria-label={status || "Loading the next gallery view"}
        aria-live="polite"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        {progress}%
      </div>
    </div>
  );
}
