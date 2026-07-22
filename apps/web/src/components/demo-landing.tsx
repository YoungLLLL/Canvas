"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { MuseumGlobe } from "@/src/components/museum-globe";
import { DemoStyles } from "@/src/components/demo-styles";
import type { Locale } from "@/src/i18n/locales";

const museumSlug = "art-institute-of-chicago";
const selfPortrait =
  "https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20Self-Portrait%20-%201954.326%20-%20Art%20Institute%20of%20Chicago.jpg?width=1200";

export function DemoLanding({ locale }: { locale: Locale }) {
  const router = useRouter();
  const zh = locale === "zh";

  useEffect(() => {
    const header = document.querySelector<HTMLElement>("#demoSiteHeader");
    const globe = document.querySelector<HTMLElement>("#globe");
    const hero = document.querySelector<HTMLElement>("#home");
    const caption = document.querySelector<HTMLElement>(".globe-home-caption");
    if (!globe || !hero) return;

    let frame = 0;
    let globeBase = 900;
    const update = () => {
      frame = 0;
      header?.classList.toggle("scrolled", window.scrollY > 24);
      const heroHeight = hero.offsetHeight || window.innerHeight;
      const raw = Math.max(0, Math.min(1, window.scrollY / (heroHeight * 0.92)));
      const progress = raw * raw * (3 - 2 * raw);
      const mobile = window.innerWidth < 720;
      globeBase = mobile ? 620 : 900;
      const startDiameter = mobile
        ? Math.max(window.innerWidth * 1.5, 620)
        : Math.max(window.innerWidth * 2, 2200);
      const endDiameter = mobile
        ? Math.min(window.innerWidth * 1.34, window.innerHeight * 0.96, 900)
        : Math.min(window.innerWidth * 0.86, window.innerHeight * 1.48, 1700);
      const startLeft =
        (window.innerWidth - startDiameter) / 2 - (mobile ? 0 : window.innerWidth * 0.04);
      const startTop = mobile
        ? Math.max(window.innerHeight * 0.7, 920)
        : window.innerHeight * 0.575 - startDiameter * 0.085;
      const endLeft = mobile ? window.innerWidth - endDiameter * 0.82 : window.innerWidth * 0.39;
      const endTop = mobile ? window.innerHeight * 0.51 : Math.max(window.innerHeight * 0.1, 68);
      const diameter = startDiameter + (endDiameter - startDiameter) * progress;
      globe.style.left = `${startLeft + (endLeft - startLeft) * progress}px`;
      globe.style.top = `${startTop + (endTop - startTop) * progress}px`;
      globe.style.transform = `scale(${diameter / globeBase})`;
      globe.style.setProperty("--globe-ui-scale", String(globeBase / diameter));
      globe.classList.toggle("home-globe-focus", progress < 0.45);
      globe.style.opacity = "1";
      if (caption) caption.style.opacity = String(Math.max(0, 1 - progress * 1.7));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
      globe.style.removeProperty("left");
      globe.style.removeProperty("top");
      globe.style.removeProperty("transform");
      globe.style.removeProperty("--globe-ui-scale");
      globe.style.removeProperty("opacity");
      globe.classList.remove("home-globe-focus");
      header?.classList.remove("scrolled");
      caption?.style.removeProperty("opacity");
    };
  }, []);

  useEffect(() => {
    const reveals = Array.from(document.querySelectorAll<HTMLElement>(".demo-faithful .reveal"));
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        }),
      { threshold: 0.2 },
    );
    reveals.forEach((element) => observer.observe(element));
    return () => {
      observer.disconnect();
      reveals.forEach((element) => element.classList.remove("visible"));
    };
  }, []);

  const scrollToMuseum = () =>
    document.querySelector("#museum")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="demo-faithful">
      <DemoStyles />
      <header className="site-header" id="demoSiteHeader">
        <button
          className="wordmark"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          CANVIUM
        </button>
        <nav aria-label={zh ? "主导航" : "Primary navigation"}>
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <span>{zh ? "每日艺术" : "Daily Art"}</span>
            <small>DAILY ART</small>
          </button>
          <button onClick={scrollToMuseum}>
            <span>{zh ? "博物馆" : "Museums"}</span>
            <small>MUSEUMS</small>
          </button>
          <button onClick={() => router.push(`/${locale}/museums/${museumSlug}/collection`)}>
            <span>{zh ? "艺术家" : "Artists"}</span>
            <small>ARTISTS</small>
          </button>
        </nav>
        <button
          className="search-pill"
          onClick={() => router.push(`/${locale}/museums/${museumSlug}/collection`)}
        >
          {zh ? "搜索" : "Search"} <span>↗</span>
        </button>
      </header>

      <main>
        <div className="view active" id="homeView" data-view="home">
          <section className="home-hero" id="home">
            <p className="side-label">EXPLORE ART / 01</p>
            <div
              className="art-history"
              aria-label={zh ? "之前推荐的作品" : "Previous recommendations"}
            >
              <figure className="history-small">
                <img
                  src="https://commons.wikimedia.org/wiki/Special:FilePath/Meisje%20met%20de%20parel.jpg?width=500"
                  alt={zh ? "维米尔《戴珍珠耳环的少女》" : "Vermeer, Girl with a Pearl Earring"}
                />
              </figure>
              <figure className="history-large">
                <img
                  src="https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20The%20Poet%27s%20Garden%20-%201933.433%20-%20Art%20Institute%20of%20Chicago.jpg?width=900"
                  alt={zh ? "梵高《诗人的花园》" : "Van Gogh, The Poet's Garden"}
                />
              </figure>
              <div className="today-note">
                <span>EXPLORE ART / 01</span>
              </div>
            </div>

            <button
              className="daily-art"
              onClick={() => router.push(`/${locale}/artworks/artic-80607`)}
              aria-label={zh ? "打开今日作品《自画像》" : "Open today's artwork, Self-Portrait"}
            >
              <img
                src={selfPortrait}
                alt={zh ? "文森特·梵高《自画像》，1887" : "Vincent van Gogh, Self-Portrait, 1887"}
              />
              <span className="daily-index">
                <b>01</b> / 03
              </span>
            </button>

            <aside className="artist-entry">
              <button className="recommendation-card" onClick={scrollToMuseum}>
                <div className="recommendation-main">
                  <span>TODAY&apos;S RECOMMENDATION / 今日推荐</span>
                  <h2>
                    Today&apos;s <i>今日推荐</i>
                    <br />
                    Recommendation
                  </h2>
                </div>
                <div className="recommendation-footer">
                  <div className="recommendation-details">
                    <strong>自画像 · Self-Portrait</strong>
                    <span>芝加哥艺术博物馆</span>
                    <small>Art Institute of Chicago</small>
                  </div>
                  <b aria-hidden="true">↗</b>
                </div>
              </button>
              <div className="glass-card">
                <div className="artist-card-heading">
                  <div className="eye-avatar">
                    <img
                      src={selfPortrait}
                      alt={zh ? "梵高自画像眼部" : "Detail of Van Gogh's eye"}
                    />
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
                  <p>
                    和梵高聊聊 <small>/ CHAT WITH VAN GOGH</small>
                  </p>
                  <button
                    className="prompt-line"
                    onClick={() => router.push(`/${locale}/artworks/artic-80607`)}
                  >
                    你想问他什么？ <i>↗</i>
                  </button>
                  <button
                    className="primary-wide"
                    onClick={() => router.push(`/${locale}/artworks/artic-80607`)}
                  >
                    开始对话 <small>START CHAT</small>
                    <span>↗</span>
                  </button>
                </div>
              </div>
            </aside>

            <button className="globe-home-caption" onClick={scrollToMuseum}>
              <span className="globe-home-museum">
                <b>芝加哥艺术博物馆</b>
                <small>ART INSTITUTE OF CHICAGO · CHICAGO</small>
              </span>
              <strong>CANVIUM Gallery</strong>
            </button>
          </section>

          <div
            className="shared-globe"
            id="globe"
            role="img"
            aria-label={
              zh
                ? "贯穿首页与博物馆页面、可拖动的真实地球"
                : "Interactive globe connecting the home and museum sections"
            }
          >
            <MuseumGlobe />
          </div>

          <section className="museum-section" id="museum">
            <div className="library-title">CANVIUM Gallery</div>
            <div className="museum-copy reveal">
              <span className="overline">TODAY&apos;S MUSEUM / 01</span>
              <h2>{zh ? "芝加哥艺术博物馆" : "Art Institute of Chicago"}</h2>
              <h3>Art Institute of Chicago</h3>
              <a href="https://www.artic.edu" target="_blank" rel="noreferrer">
                CHICAGO · UNITED STATES
              </a>
              <span className="museum-type">综合艺术博物馆 · 数字馆藏已开放</span>
              <p>
                {zh
                  ? "收藏跨越五千年艺术史，以印象派、后印象派及美国现代艺术收藏闻名。"
                  : "A collection spanning five thousand years, celebrated for Impressionist, Post-Impressionist, and modern American art."}
              </p>
              <div className="museum-feature">
                <img
                  src={selfPortrait}
                  alt={zh ? "馆藏亮点：梵高自画像" : "Collection highlight: Van Gogh Self-Portrait"}
                />
                <div>
                  <small>{zh ? "今日推荐" : "TODAY'S PICK"}</small>
                  <strong>{zh ? "自画像" : "Self-Portrait"}</strong>
                  <span>文森特·梵高 · 1887</span>
                  <em>精选馆藏已上线 · 03 件作品 · 01 位艺术家</em>
                </div>
              </div>
              <button
                className="enter-gallery"
                onClick={() => router.push(`/${locale}/museums/${museumSlug}/collection`)}
              >
                {zh ? "探索馆藏" : "Explore collection"} <span>↗</span>
              </button>
              <a className="official" href="https://www.artic.edu" target="_blank" rel="noreferrer">
                {zh ? "官方网站" : "Official website"}　↗
              </a>
            </div>
            <div
              className="globe-stage reveal"
              aria-label={zh ? "可拖动的全球博物馆索引" : "Interactive global museum index"}
            >
              <div className="region-stats">
                <b>NORTH AMERICA</b>
                <span>
                  <i>3</i>　 MUSEUMS OPEN
                </span>
                <span>
                  <i>7</i>　 MUSEUMS INDEXED
                </span>
              </div>
              <div className="drag-cue">●　拖动旋转 · DRAG TO ROTATE</div>
              <div className="globe-legend">
                <span>●　已开放</span>
                <span>○　即将开放</span>
                <span>◉　今日推荐</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
