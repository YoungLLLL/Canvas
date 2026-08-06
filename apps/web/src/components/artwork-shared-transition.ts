"use client";

import gsap from "gsap";

const OVERLAY_ID = "canvium-artwork-transition";
const TRANSITION_DURATION = 0.9;

type TransitionOverlay = {
  image: HTMLImageElement;
  root: HTMLDivElement;
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function currentOverlay(): TransitionOverlay | null {
  const root = document.getElementById(OVERLAY_ID) as HTMLDivElement | null;
  const image = root?.querySelector<HTMLImageElement>("img");
  return root && image ? { image, root } : null;
}

function removeCurrentOverlay() {
  const overlay = currentOverlay();
  if (!overlay) return;
  gsap.killTweensOf([overlay.root, overlay.image]);
  overlay.root.remove();
}

function createOverlay(source: HTMLImageElement, phase: "entering" | "exiting") {
  removeCurrentOverlay();

  const rect = source.getBoundingClientRect();
  const root = document.createElement("div");
  const image = source.cloneNode(false) as HTMLImageElement;
  const computed = window.getComputedStyle(source);

  root.id = OVERLAY_ID;
  root.dataset.phase = phase;
  root.setAttribute("aria-hidden", "true");
  Object.assign(root.style, {
    backgroundColor: phase === "exiting" ? "#0d1717" : "rgba(13, 23, 23, 0)",
    inset: "0",
    overflow: "hidden",
    pointerEvents: "all",
    position: "fixed",
    zIndex: "2147483000",
  });
  image.removeAttribute("id");
  image.removeAttribute("loading");
  image.removeAttribute("srcset");
  image.draggable = false;
  Object.assign(image.style, {
    borderRadius: computed.borderRadius,
    height: `${rect.height}px`,
    left: `${rect.left}px`,
    maxHeight: "none",
    maxWidth: "none",
    objectFit: computed.objectFit || "cover",
    objectPosition: computed.objectPosition || "50% 50%",
    position: "fixed",
    top: `${rect.top}px`,
    transform: "none",
    transformOrigin: "0 0",
    userSelect: "none",
    width: `${rect.width}px`,
  });
  root.appendChild(image);
  document.body.appendChild(root);
  return { image, root };
}

function detailImageRect(source: HTMLImageElement) {
  const naturalRatio =
    source.naturalWidth && source.naturalHeight
      ? source.naturalWidth / source.naturalHeight
      : source.getBoundingClientRect().width / source.getBoundingClientRect().height;
  const width = window.innerWidth;
  return {
    height: width / naturalRatio,
    left: 0,
    top: 0,
    width,
  };
}

export function startArtworkEnterTransition(sourceCard: HTMLElement, navigate: () => void) {
  const source = sourceCard.querySelector<HTMLImageElement>("img");
  if (!source || prefersReducedMotion()) {
    navigate();
    return;
  }

  const overlay = createOverlay(source, "entering");
  const target = detailImageRect(source);
  const previousOverflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = "hidden";
  source.style.visibility = "hidden";

  gsap
    .timeline({
      defaults: { duration: TRANSITION_DURATION, ease: "power4.inOut" },
      onComplete: () => {
        document.documentElement.style.overflow = previousOverflow;
        overlay.root.dataset.phase = "awaiting-detail";
        navigate();
        window.setTimeout(() => {
          if (overlay.root.isConnected && overlay.root.dataset.phase === "awaiting-detail") {
            overlay.root.remove();
          }
        }, 12_000);
      },
    })
    .to(
      overlay.image,
      {
        borderRadius: 0,
        height: target.height,
        left: target.left,
        top: target.top,
        width: target.width,
      },
      0,
    )
    .to(overlay.root, { backgroundColor: "#0d1717" }, 0);
}

export function getArtworkEnterOverlay() {
  const overlay = currentOverlay();
  return overlay?.root.dataset.phase === "awaiting-detail" ? overlay : null;
}

export function removeArtworkTransitionOverlay() {
  removeCurrentOverlay();
}

export function focusReturnedArtwork(targetCard: HTMLElement | null) {
  if (!targetCard) return;
  targetCard.dataset.collectionReturnFocus = "true";
  targetCard.focus({ preventScroll: true });
  window.requestAnimationFrame(() => {
    delete targetCard.dataset.collectionReturnFocus;
  });
}

export function startArtworkExitTransition(source: HTMLImageElement | null, navigate: () => void) {
  if (!source || prefersReducedMotion()) {
    navigate();
    return;
  }

  const overlay = createOverlay(source, "exiting");
  const page = source.closest<HTMLElement>("main");
  const interfaceElements = page?.querySelectorAll<HTMLElement>("[data-artwork-transition-ui]");
  window.setTimeout(() => {
    if (!overlay.root.isConnected || overlay.root.dataset.phase !== "exiting") return;
    gsap.killTweensOf([overlay.root, overlay.image]);
    overlay.root.remove();
    if (interfaceElements?.length) {
      gsap.to(interfaceElements, { autoAlpha: 1, duration: 0.2, overwrite: true });
    }
  }, 8_000);
  const timeline = gsap.timeline({
    defaults: { ease: "power2.out" },
    onComplete: navigate,
  });
  if (interfaceElements?.length) {
    timeline.to(interfaceElements, { autoAlpha: 0, duration: 0.18, stagger: 0.015 }, 0);
  }
  timeline.to(overlay.root, { backgroundColor: "#0d1717", duration: 0.18 }, 0);
}

export function finishArtworkExitTransition(targetCard: HTMLElement | null) {
  const overlay = currentOverlay();
  if (!overlay || overlay.root.dataset.phase !== "exiting") return;

  const target = targetCard?.querySelector<HTMLImageElement>("img") ?? null;
  if (!target) {
    gsap.to(overlay.root, {
      autoAlpha: 0,
      duration: 0.25,
      onComplete: () => overlay.root.remove(),
    });
    return;
  }

  overlay.root.dataset.phase = "returning";
  const rect = target.getBoundingClientRect();
  const computed = window.getComputedStyle(target);
  const previousVisibility = target.style.visibility;
  target.style.visibility = "hidden";

  gsap
    .timeline({
      defaults: { duration: TRANSITION_DURATION, ease: "power4.inOut" },
      onComplete: () => {
        target.style.visibility = previousVisibility;
        overlay.root.remove();
        focusReturnedArtwork(targetCard);
      },
    })
    .to(
      overlay.image,
      {
        borderRadius: computed.borderRadius,
        height: rect.height,
        left: rect.left,
        objectFit: computed.objectFit || "cover",
        objectPosition: computed.objectPosition || "50% 50%",
        top: rect.top,
        width: rect.width,
      },
      0,
    )
    .to(overlay.root, { backgroundColor: "rgba(13, 23, 23, 0)" }, 0);
}
