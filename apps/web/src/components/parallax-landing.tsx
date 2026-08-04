"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef } from "react";

import styles from "@/src/components/parallax-landing.module.css";
import type { Locale } from "@/src/i18n/locales";

type ParallaxLayer = {
  src: string;
  x: number;
  y: number;
  scroll: number;
  scale: number;
};

const layers: ParallaxLayer[] = [
  {
    src: "/parallax/0-background.png",
    x: 3,
    y: 2,
    scroll: 0,
    scale: 1.025,
  },
  { src: "/parallax/1.png", x: 7, y: 5, scroll: -5, scale: 1.035 },
  { src: "/parallax/2.png", x: 8, y: 6, scroll: -7, scale: 1.038 },
  { src: "/parallax/3.png", x: 15, y: 10, scroll: -16, scale: 1.052 },
  { src: "/parallax/4.png", x: 12, y: 8, scroll: -12, scale: 1.046 },
  { src: "/parallax/5.png", x: 10, y: 7, scroll: -10, scale: 1.042 },
  { src: "/parallax/6.png", x: 14, y: 9, scroll: -14, scale: 1.05 },
  { src: "/parallax/7.png", x: 17, y: 11, scroll: -18, scale: 1.056 },
  {
    src: "/parallax/8-furniture.png",
    x: 22,
    y: 14,
    scroll: -24,
    scale: 1.068,
  },
  { src: "/parallax/9-laptop.png", x: 6, y: 4, scroll: -5, scale: 1.034 },
];

type StageStyle = React.CSSProperties & {
  "--hint-opacity": number;
};

type LayerStyle = React.CSSProperties & {
  "--tx": string;
  "--ty": string;
  "--layer-scale": number;
  "--layer-index": number;
  "--layer-delay": string;
};

export function ParallaxLanding({ locale }: { locale: Locale }) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rootNode = root.current;
    const stageNode = stage.current;
    if (!rootNode || !stageNode) return;
    document.body.classList.add("parallax-home-active");
    const layerNodes = Array.from(stageNode.querySelectorAll<HTMLElement>(`.${styles.layer}`));

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");
    let frame = 0;
    let currentX = 0;
    let currentY = 0;
    let currentScroll = 0;
    let targetX = 0;
    let targetY = 0;
    let targetScroll = 0;

    const paint = () => {
      frame = 0;
      const ease = reducedMotion.matches ? 1 : 0.085;
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;
      currentScroll += (targetScroll - currentScroll) * ease;
      stageNode.style.setProperty("--hint-opacity", String(Math.max(0, 1 - currentScroll * 3)));
      layerNodes.forEach((node, index) => {
        const layer = layers[index];
        if (!layer) return;
        const x = currentX * layer.x * -1;
        const y =
          currentY * layer.y * -1 + currentScroll * layer.scroll * (window.innerHeight / 100);
        node.style.setProperty("--tx", `${x.toFixed(2)}px`);
        node.style.setProperty("--ty", `${y.toFixed(2)}px`);
      });

      if (
        Math.abs(targetX - currentX) > 0.001 ||
        Math.abs(targetY - currentY) > 0.001 ||
        Math.abs(targetScroll - currentScroll) > 0.001
      ) {
        frame = window.requestAnimationFrame(paint);
      }
    };

    const schedulePaint = () => {
      if (!frame) frame = window.requestAnimationFrame(paint);
    };

    const updateScroll = () => {
      if (reducedMotion.matches) {
        targetScroll = 0;
      } else {
        const distance = Math.max(1, rootNode.offsetHeight - window.innerHeight);
        targetScroll = Math.min(1, Math.max(0, window.scrollY / distance));
      }
      schedulePaint();
    };

    const updatePointer = (event: PointerEvent) => {
      if (!finePointer.matches || reducedMotion.matches) return;
      targetX = (event.clientX / window.innerWidth - 0.5) * 2;
      targetY = (event.clientY / window.innerHeight - 0.5) * 2;
      schedulePaint();
    };

    const resetPointer = () => {
      targetX = 0;
      targetY = 0;
      schedulePaint();
    };

    const resetMotion = () => {
      if (reducedMotion.matches) {
        targetX = 0;
        targetY = 0;
      }
      updateScroll();
    };

    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll);
    window.addEventListener("pointermove", updatePointer, { passive: true });
    document.documentElement.addEventListener("mouseleave", resetPointer);
    reducedMotion.addEventListener("change", resetMotion);

    return () => {
      document.body.classList.remove("parallax-home-active");
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
      window.removeEventListener("pointermove", updatePointer);
      document.documentElement.removeEventListener("mouseleave", resetPointer);
      reducedMotion.removeEventListener("change", resetMotion);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const zh = locale === "zh";

  return (
    <main className={`${styles.root} parallax-home-root`} ref={root}>
      <h1 className="sr-only">Canvium Gallery</h1>
      <div
        aria-label={
          zh
            ? "艺术家们围在 Canvium 笔记本电脑旁的分层视差场景"
            : "A layered parallax scene of artists gathered around a Canvium laptop"
        }
        className={styles.stage}
        ref={stage}
        role="img"
        style={{ "--hint-opacity": 1 } as StageStyle}
      >
        <div className={styles.scene}>
          {layers.map((layer, index) => (
            <img
              alt=""
              aria-hidden="true"
              className={styles.layer}
              decoding="async"
              fetchPriority={index === 0 ? "high" : "auto"}
              key={layer.src}
              loading="eager"
              src={layer.src}
              style={
                {
                  "--tx": "0px",
                  "--ty": "0px",
                  "--layer-scale": layer.scale,
                  "--layer-index": index,
                  "--layer-delay": `${40 + index * 34}ms`,
                } as LayerStyle
              }
            />
          ))}
        </div>

        <p aria-hidden="true" className={styles.hint}>
          <span>
            {zh ? "移动鼠标 · 向下滚动" : "Move to explore · Scroll to shift perspective"}
          </span>
          <i />
        </p>
      </div>
    </main>
  );
}
