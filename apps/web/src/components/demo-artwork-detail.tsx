"use client";

/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import { useState } from "react";

type DemoArtworkProps = {
  locale: "en" | "zh";
  imageUrl: string | null;
  ratio: number;
  title: string;
  originalTitle: string;
  artist: string;
  date: string;
  description: string;
  medium: string;
  dimensions: string;
  museumUrl: string;
  imageSourceUrl?: string;
  licenseLabel: string;
  licenseUrl?: string;
};

export function DemoArtworkDetail(props: DemoArtworkProps) {
  const router = useRouter();
  const [scale, setScale] = useState(1);
  const [loaded, setLoaded] = useState(true);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const zh = props.locale === "zh";

  return (
    <main
      className="view artwork-view active"
      style={{ "--detail-ratio": props.ratio } as React.CSSProperties}
    >
      <button
        className="back-gallery"
        onClick={() => router.back()}
        aria-label={zh ? "关闭作品详情，返回画廊" : "Close artwork and return to gallery"}
      >
        <span aria-hidden="true" />
      </button>
      <div className="art-pane">
        <div
          className={`art-viewport${scale > 1 ? " zoomed" : ""}`}
          onDoubleClick={() => setScale((value) => (value > 1 ? 1 : 2))}
        >
          {props.imageUrl ? (
            <img
              alt={props.title}
              draggable={false}
              onLoad={() => setLoaded(true)}
              src={props.imageUrl}
              style={{ transform: `scale(${scale})`, viewTransitionName: "artwork-image" }}
            />
          ) : (
            <div className="artwork-no-image" role="status">
              <span>IMAGE / NOT DISPLAYED</span>
              <strong>{zh ? "无可展示图片" : "No displayed image"}</strong>
              <p>
                {zh
                  ? "作品资料仍可查看；Canvium 不会在图片权利或精确来源未满足规则时展示图像。"
                  : "The record remains available. Canvium does not display an image until its rights and exact source meet the publication rules."}
              </p>
            </div>
          )}
          <div className={`loading${loaded || !props.imageUrl ? " hidden" : ""}`}>
            {zh ? "正在展开高清作品…" : "Opening high-resolution artwork…"}
          </div>
          <div className="viewer-controls">
            <button
              onClick={() => setScale((value) => Math.max(1, value - 0.25))}
              aria-label={zh ? "缩小" : "Zoom out"}
            >
              −
            </button>
            <span>{Math.round(scale * 100)}%</span>
            <button
              onClick={() => setScale((value) => Math.min(4, value + 0.25))}
              aria-label={zh ? "放大" : "Zoom in"}
            >
              ＋
            </button>
            <button onClick={() => setScale(1)}>{zh ? "复位" : "Reset"}</button>
            <button onClick={() => document.documentElement.requestFullscreen?.()}>
              {zh ? "全屏" : "Fullscreen"} ↗
            </button>
          </div>
        </div>
      </div>
      <aside className="dialogue-pane">
        <section className="artwork-summary">
          <span className="artwork-detail-index">02 / 03</span>
          <h1>{props.title}</h1>
          <p className="artwork-original-title">{props.originalTitle}</p>
          <div className="artist-meta">
            {props.imageUrl ? (
              <span className="eye-avatar">
                <img src={props.imageUrl} alt="" />
              </span>
            ) : null}
            <b>
              {props.artist} · {props.date} · {zh ? "巴黎" : "Paris"}
            </b>
          </div>
          <p className="artwork-introduction">{props.description}</p>
          <dl className="artwork-quick-facts">
            <div>
              <dt>{zh ? "馆藏" : "Collection"}</dt>
              <dd>{zh ? "芝加哥艺术博物馆" : "Art Institute of Chicago"}</dd>
            </div>
            <div>
              <dt>{zh ? "媒介 / 尺寸" : "Medium / dimensions"}</dt>
              <dd>
                {props.medium}
                <br />
                {props.dimensions}
              </dd>
            </div>
          </dl>
        </section>
        <div className="conversation-title">
          <span>ARTIST PERSONA / NOT PUBLISHED</span>
        </div>
        <div className="messages ai-unavailable" role="status" aria-live="polite">
          <section aria-labelledby="ai-unavailable-title">
            <span className="ai-status-label">AI DIALOGUE / UNAVAILABLE</span>
            <h2 id="ai-unavailable-title">
              {zh ? "艺术家数字化身尚未开放" : "The artist persona is not available yet"}
            </h2>
            <p>
              {zh
                ? "该艺术家的人格资料、史料边界与回答依据仍在审核中。在正式发布前，Canvium 不会模拟艺术家的身份回答。"
                : "This artist's persona, historical boundaries, and supporting evidence are still under review. Canvium will not simulate the artist before publication."}
            </p>
            <button className="evidence-button" onClick={() => setSourcesOpen(true)}>
              {zh ? "查看作品资料与来源" : "View artwork records and sources"}
            </button>
          </section>
        </div>
        <div
          className="observation-prompts"
          aria-label={zh ? "独立观看提示" : "Independent looking prompts"}
        >
          <span>
            {zh ? "不依赖 AI，也可以先这样观看" : "Look independently while AI is unavailable"}
          </span>
          <ul>
            <li>
              {zh
                ? "画面中最强的明暗或色彩对比在哪里？"
                : "Where is the strongest contrast of light or color?"}
            </li>
            <li>
              {zh
                ? "笔触、边缘与留白如何引导你的视线？"
                : "How do brushwork, edges, and empty space guide your eye?"}
            </li>
          </ul>
        </div>
      </aside>
      <div
        className={`source-backdrop${sourcesOpen ? " open" : ""}`}
        onClick={() => setSourcesOpen(false)}
      />
      <aside
        className={`source-drawer${sourcesOpen ? " open" : ""}`}
        aria-label={zh ? "回答依据" : "Sources"}
      >
        <button onClick={() => setSourcesOpen(false)}>{zh ? "关闭" : "Close"}　×</button>
        <span>SOURCES / ARTWORK</span>
        <h2>
          {zh ? (
            <>
              这件作品的
              <br />
              资料从哪里来？
            </>
          ) : (
            <>
              Sources for
              <br />
              this artwork
            </>
          )}
        </h2>
        <article>
          <em>MUSEUM RECORD</em>
          <b>Art Institute of Chicago</b>
          <p>{props.description}</p>
          <a href={props.museumUrl} target="_blank" rel="noreferrer">
            {zh ? "查看馆方资料" : "View museum record"} ↗
          </a>
        </article>
        {props.imageSourceUrl ? (
          <article>
            <em>IMAGE / {props.licenseLabel}</em>
            <b>{zh ? "图像来源与许可" : "Image source and license"}</b>
            <a href={props.imageSourceUrl} target="_blank" rel="noreferrer">
              Wikimedia Commons ↗
            </a>
            {props.licenseUrl ? (
              <a href={props.licenseUrl} target="_blank" rel="noreferrer">
                　{props.licenseLabel} ↗
              </a>
            ) : null}
          </article>
        ) : null}
      </aside>
    </main>
  );
}
