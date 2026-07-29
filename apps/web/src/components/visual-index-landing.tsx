"use client";

/* eslint-disable @next/next/no-img-element */
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useRef } from "react";

import styles from "@/src/components/visual-index-landing.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export type VisualIndexArtwork = {
  sourceId: string;
  title: string;
  secondaryTitle: string | null;
  artist: string;
  date: string;
  imageUrl: string;
  alt: string;
};

const imageSlots = new Set([
  0, 3, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44, 47, 50, 54, 57,
]);
const variants = ["wide", "portrait", "square", "landscape"] as const;

export function VisualIndexLanding({
  artworks,
  locale,
  total,
}: {
  artworks: VisualIndexArtwork[];
  locale: "en" | "zh";
  total: number;
}) {
  const root = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const zh = locale === "zh";
  let artworkCursor = 0;

  useGSAP(
    () => {
      document.body.classList.add("visual-index-active");
      const media = gsap.matchMedia();

      media.add(
        {
          desktop: "(min-width: 861px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { desktop, reduceMotion } = context.conditions as {
            desktop: boolean;
            reduceMotion: boolean;
          };

          if (reduceMotion) {
            gsap.set(`.${styles.artworkSlot}`, { autoAlpha: 1, y: 0 });
            return;
          }

          const intro = gsap.timeline({
            defaults: { duration: 1.15, ease: "power4.out" },
          });
          intro
            .from(`.${styles.header}`, { autoAlpha: 0, y: -14 }, 0.1)
            .from(`.${styles.heroMeta}`, { autoAlpha: 0, y: 26 }, 0.18)
            .from(`.${styles.heroAside}`, { autoAlpha: 0, y: 26 }, 0.24)
            .from(`.${styles.heroWord}`, { autoAlpha: 0, yPercent: 28 }, 0.12);

          gsap.set(`.${styles.artworkSlot}`, { autoAlpha: 0, y: 36 });

          gsap.to(`.${styles.heroWord}`, {
            autoAlpha: 0.12,
            ease: "none",
            scale: desktop ? 0.84 : 0.94,
            scrollTrigger: {
              trigger: `.${styles.hero}`,
              start: "top top",
              end: "bottom top",
              scrub: 0.8,
            },
            yPercent: 32,
          });

          ScrollTrigger.batch(`.${styles.artworkSlot}`, {
            batchMax: desktop ? 4 : 2,
            interval: 0.08,
            onEnter: (batch) =>
              gsap.to(batch, {
                autoAlpha: 1,
                duration: 0.9,
                ease: "power3.out",
                overwrite: true,
                stagger: 0.08,
                y: 0,
              }),
            once: true,
            start: "top 92%",
          });

          const nodes = gsap.utils.toArray<HTMLElement>(`.${styles.artworkSlot}`);
          nodes.forEach((node) => {
            const image = node.querySelector("img");
            if (!image) return;
            gsap.fromTo(
              image,
              { yPercent: -7 },
              {
                ease: "none",
                scrollTrigger: {
                  trigger: node,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 0.7,
                },
                yPercent: 7,
              },
            );
          });

          if (progress.current) {
            const setProgress = gsap.quickSetter(progress.current, "scaleY");
            ScrollTrigger.create({
              start: 0,
              end: "max",
              onUpdate: (self) => setProgress(self.progress),
            });
          }

          const refresh = () => ScrollTrigger.refresh();
          window.addEventListener("load", refresh, { once: true });
          return () => window.removeEventListener("load", refresh);
        },
      );

      return () => {
        media.revert();
        document.body.classList.remove("visual-index-active");
      };
    },
    { scope: root },
  );

  const slots = Array.from({ length: 60 }, (_, index) => {
    if (!imageSlots.has(index) || !artworks.length) {
      return (
        <div className={styles.slot} key={index}>
          <span className={styles.slotNumber}>{String(index).padStart(2, "0")}</span>
        </div>
      );
    }

    const artwork = artworks[artworkCursor % artworks.length];
    const variant = variants[artworkCursor % variants.length];
    artworkCursor += 1;
    return (
      <article
        className={`${styles.slot} ${styles.artworkSlot}`}
        data-variant={variant}
        key={index}
      >
        <span className={styles.slotNumber}>{String(index).padStart(2, "0")}</span>
        <Link
          aria-label={`${zh ? "打开作品" : "Open artwork"}: ${artwork.title}`}
          className={styles.artworkLink}
          href={`/${locale}/artworks/artic-${artwork.sourceId}`}
        >
          <img
            alt={artwork.alt}
            decoding="async"
            loading={index < 9 ? "eager" : "lazy"}
            src={artwork.imageUrl}
          />
          <span className={styles.artworkMeta}>
            <strong>{artwork.title}</strong>
            <span>{artwork.date}</span>
            <small>
              {artwork.artist}
              {artwork.secondaryTitle ? ` · ${artwork.secondaryTitle}` : ""}
            </small>
            <b aria-hidden="true">↗</b>
          </span>
        </Link>
      </article>
    );
  });

  return (
    <div className={styles.root} ref={root}>
      <div aria-hidden="true" className={styles.progress} ref={progress} />
      <header className={styles.header}>
        <p>© {new Date().getFullYear()}</p>
        <Link className={styles.brand} href={`/${locale}`}>
          Canvium
        </Link>
        <nav className={styles.nav} aria-label={zh ? "主导航" : "Primary navigation"}>
          <a href="#index">{zh ? "作品" : "Work"}</a>
          <Link href={`/${locale}/museums/art-institute-of-chicago/collection`}>
            {zh ? "索引" : "Index"}
          </Link>
          <Link href={locale === "zh" ? "/en" : "/zh"}>{locale === "zh" ? "EN" : "中文"}</Link>
        </nav>
      </header>

      <main>
        <section className={styles.hero}>
          <p className={styles.heroMeta}>
            {zh
              ? "开放艺术馆藏的数字观看空间"
              : "A digital viewing space for open museum collections"}
            <span>
              {zh
                ? "真实记录 · 开放图像 · 近距离观看"
                : "Verified records · open images · close looking"}
            </span>
          </p>
          <p className={styles.heroAside}>
            Chicago / Online
            <span>{total.toLocaleString(locale)} works indexed</span>
          </p>
          <p aria-label="Canvium" className={styles.heroWord}>
            CANVIUM
          </p>
          <a className={styles.scrollCue} href="#index">
            {zh ? "浏览索引" : "View index"}
          </a>
        </section>

        <section className={styles.indexIntro} id="index">
          <h1>{zh ? "让图像决定观看的节奏。" : "Let the images set the rhythm."}</h1>
          <div>
            <p>
              {zh
                ? "作品保留自身比例与空白，不被统一卡片强行裁切。每次滚动，都是一次新的视觉路径。"
                : "Native proportions and deliberate gaps let the collection compose its own visual path."}
            </p>
            <p>
              {zh
                ? "悬停查看记录，点击进入作品。"
                : "Hover for the record. Open a work to look closer."}
            </p>
          </div>
        </section>

        <section
          className={styles.indexCanvas}
          aria-label={zh ? "作品视觉索引" : "Visual artwork index"}
        >
          {artworks.length ? (
            slots
          ) : (
            <div className={styles.empty}>
              <p>
                {zh ? "馆藏暂时无法载入。" : "The collection is temporarily unavailable."}
                <br />
                <Link href={`/${locale}/museums/art-institute-of-chicago/collection`}>
                  {zh ? "前往完整馆藏" : "Open the full collection"}
                </Link>
              </p>
            </div>
          )}
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <p>
            {zh
              ? "CANVIUM 连接开放馆藏、可信记录与个人观看。"
              : "Canvium connects open collections, trusted records, and personal looking."}
          </p>
          <nav>
            <Link href={`/${locale}/museums/art-institute-of-chicago/collection`}>
              {zh ? "完整馆藏 ↗" : "Full collection ↗"}
            </Link>
            <Link href={`/${locale}#index`}>{zh ? "返回顶部 ↑" : "Back to top ↑"}</Link>
          </nav>
        </div>
        <p className={styles.footerWord}>CANVIUM</p>
      </footer>
    </div>
  );
}
