"use client";

import { useEffect } from "react";

export function ShowcaseMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const header = document.querySelector<HTMLElement>(".site-header");
    const composition = document.querySelector<HTMLElement>(".home-composition");
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

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        }
      },
      { threshold: 0.16 },
    );
    document
      .querySelectorAll(".motion-reveal, .artwork-card")
      .forEach((element) => observer.observe(element));

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    composition?.addEventListener("pointermove", updatePointer, { passive: true });
    composition?.addEventListener("pointerleave", resetPointer);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      root.classList.remove("motion-ready");
      window.removeEventListener("scroll", updateHeader);
      composition?.removeEventListener("pointermove", updatePointer);
      composition?.removeEventListener("pointerleave", resetPointer);
    };
  }, []);

  return null;
}
