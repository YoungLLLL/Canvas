"use client";

import { useEffect } from "react";

export function ShowcaseMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const header = document.querySelector<HTMLElement>(".site-header");
    const composition = document.querySelector<HTMLElement>(".home-composition, .home-hero");
    const dailyArtwork = composition?.querySelector<HTMLElement>(".daily-art");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    root.classList.add("motion-ready");

    const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 20);
    const updatePointer = (event: PointerEvent) => {
      if (!composition || reducedMotion.matches || event.pointerType === "touch") return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = composition.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        composition.style.setProperty("--pointer-x", x.toFixed(3));
        composition.style.setProperty("--pointer-y", y.toFixed(3));
      });
    };
    const resetPointer = () => {
      composition?.style.setProperty("--pointer-x", "0");
      composition?.style.setProperty("--pointer-y", "0");
    };
    const releaseEntranceTransform = () => {
      // The preserved Demo entrance animation fills forwards. Release its final
      // transform so the Stage 8 pointer response can take over afterwards.
      if (dailyArtwork) dailyArtwork.style.animation = "none";
    };

    const revealElements = Array.from(
      document.querySelectorAll<HTMLElement>(".motion-reveal, .artwork-grid .artwork-card"),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        }
      },
      { threshold: 0.16 },
    );
    revealElements.forEach((element) => observer.observe(element));

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    composition?.addEventListener("pointermove", updatePointer, { passive: true });
    composition?.addEventListener("pointerleave", resetPointer);
    dailyArtwork?.addEventListener("animationend", releaseEntranceTransform, { once: true });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      root.classList.remove("motion-ready");
      header?.classList.remove("is-scrolled");
      composition?.style.removeProperty("--pointer-x");
      composition?.style.removeProperty("--pointer-y");
      revealElements.forEach((element) => element.classList.remove("is-visible"));
      if (dailyArtwork) dailyArtwork.style.removeProperty("animation");
      window.removeEventListener("scroll", updateHeader);
      composition?.removeEventListener("pointermove", updatePointer);
      composition?.removeEventListener("pointerleave", resetPointer);
      dailyArtwork?.removeEventListener("animationend", releaseEntranceTransform);
    };
  }, []);

  return null;
}
