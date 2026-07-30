"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { DemoStyles } from "@/src/components/demo-styles";
import { MuseumGlobe } from "@/src/components/museum-globe";

import styles from "./concept-v1.module.css";

const locale = "zh";
const museumSlug = "art-institute-of-chicago";
const selfPortrait =
  "https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20Self-Portrait%20-%201954.326%20-%20Art%20Institute%20of%20Chicago.jpg?width=1200";

export function ConceptV1() {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const collectionHref = `/${locale}/museums/${museumSlug}/collection`;
  const artworkHref = `/${locale}/artworks/artic-80607`;

  useEffect(() => {
    router.prefetch(collectionHref);
    router.prefetch(artworkHref);
  }, [artworkHref, collectionHref, router]);

  useEffect(() => {
    const scope = root.current;
    if (!scope) return;
    const reveals = Array.from(scope.querySelectorAll<HTMLElement>(".reveal"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.2 },
    );
    reveals.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const scrollToHome = () => {
    heroRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToMuseum = () => {
    root.current?.querySelector("#conceptMuseum")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={`${styles.page} demo-faithful`} ref={root}>
      <DemoStyles />

      <header className="site-header" id="conceptSiteHeader">
        <button className="wordmark" onClick={scrollToHome}>
          CANVIUM
        </button>
        <nav aria-label="主导航">
          <button onClick={scrollToHome}>
            <span>每日艺术</span>
            <small>DAILY ART</small>
          </button>
          <button onClick={scrollToMuseum}>
            <span>博物馆</span>
            <small>MUSEUMS</small>
          </button>
        </nav>
        <button className="search-pill" onClick={() => router.push(collectionHref)}>
          <span>探索馆藏</span>
          <small>EXPLORE</small>
          <b aria-hidden="true">↗</b>
        </button>
      </header>

      <main>
        <div className="view active">
          <section className="home-hero" id="conceptHome" ref={heroRef}>
            <div className="art-history" aria-label="之前推荐的作品">
              <figure className="history-large">
                <img
                  src="https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20The%20Poet%27s%20Garden%20-%201933.433%20-%20Art%20Institute%20of%20Chicago.jpg?width=900"
                  alt="梵高《诗人的花园》"
                />
                <figcaption>
                  <strong>
                    诗人的花园
                    <small>THE POET&apos;S GARDEN</small>
                  </strong>
                  <span>之前推荐 / PREVIOUSLY FEATURED</span>
                </figcaption>
              </figure>
            </div>

            <button
              className="daily-art"
              onClick={() => router.push(artworkHref)}
              aria-label="打开今日作品《自画像》"
            >
              <img src={selfPortrait} alt="文森特·梵高《自画像》，1887" />
              <span className="daily-index">
                <b>01</b> / 02
              </span>
              <span className="daily-caption">
                <strong>
                  自画像
                  <i>SELF-PORTRAIT</i>
                </strong>
                <small>今日推荐 / TODAY&apos;S RECOMMENDATION</small>
              </span>
            </button>

            <aside className="artist-entry">
              <div className="glass-card">
                <div className="artist-card-heading">
                  <div className="eye-avatar">
                    <img src={selfPortrait} alt="梵高自画像眼部" />
                  </div>
                  <div>
                    <span>DIGITAL ARTIST / 数字艺术家</span>
                    <h1>
                      Chat with
                      <br />
                      Van Gogh
                    </h1>
                  </div>
                </div>
                <div className="artist-card-actions">
                  <button className="primary-wide" onClick={() => router.push(artworkHref)}>
                    开始对话 <small>START CHAT</small>
                    <span>↗</span>
                  </button>
                </div>
              </div>
            </aside>
          </section>

          <section className="museum-section" id="conceptMuseum">
            <div className="library-title">CANVIUM Gallery</div>

            <div className="museum-copy reveal">
              <span className="overline">SELECTED MUSEUM / 01</span>
              <h2>芝加哥艺术博物馆</h2>
              <h3>Art Institute of Chicago</h3>
              <a href="https://www.artic.edu" target="_blank" rel="noreferrer">
                CHICAGO · UNITED STATES
              </a>
              <span className="museum-type">综合艺术博物馆 · 数字馆藏已开放</span>
              <p>收藏跨越五千年艺术史，以印象派、后印象派及美国现代艺术收藏闻名。</p>
              <button className="enter-gallery" onClick={() => router.push(collectionHref)}>
                进入馆藏 <span>↗</span>
              </button>
              <a className="official" href="https://www.artic.edu" target="_blank" rel="noreferrer">
                官方网站　↗
              </a>
            </div>

            <div className={styles.globeHost} aria-label="可拖动的全球艺术馆索引">
              <MuseumGlobe locale={locale} />
              <div className={styles.globeStats}>
                <b>GLOBAL MUSEUM INDEX</b>
                <span>
                  <i>3</i>　 MUSEUMS OPEN
                </span>
              </div>
              <div className={styles.dragCue}>●　拖动旋转 · DRAG TO ROTATE</div>
              <div className={styles.globeLegend}>
                <span>●　已开放</span>
                <span>○　即将开放</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
