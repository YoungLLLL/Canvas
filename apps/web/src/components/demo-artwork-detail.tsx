"use client";

/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

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
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const zh = props.locale === "zh";

  const ask = (text: string) => {
    if (!text.trim()) return;
    setMessages((items) => [...items, text.trim()]);
    setQuestion("");
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    ask(question);
  };

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
          ) : null}
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
            <span className="eye-avatar">
              <img src={props.imageUrl || ""} alt="" />
            </span>
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
          <span>CONVERSATION / 01</span>
          <button onClick={() => setMessages([])}>{zh ? "关闭对话" : "Clear"}　×</button>
        </div>
        <div className="messages" aria-live="polite">
          <div className="message assistant">
            <span className="eye-avatar msg-eye">
              <img src={props.imageUrl || ""} alt="" />
            </span>
            <b>VINCENT VAN GOGH</b>
            <p>
              {zh
                ? "哦，你正在看我的自画像。这是我住在巴黎时画的；没有模特时，我自己就是最方便的对象。有人愿意认真看看这张脸，我很高兴。"
                : "You are looking at my self-portrait, painted while I lived in Paris. When a model was unavailable, I was the most convenient subject."}
            </p>
            <div className="evidence-row">
              <span>{zh ? "依据馆藏资料生成" : "Grounded in collection records"}</span>
              <button className="evidence-button" onClick={() => setSourcesOpen(true)}>
                {zh ? "查看依据" : "View sources"}
              </button>
            </div>
          </div>
          {messages.map((message, index) => (
            <div className="message user" key={`${message}-${index}`}>
              <small>YOU</small>
              <p>{message}</p>
            </div>
          ))}
        </div>
        <div className="suggestions">
          {[
            zh ? "为什么画这么多自画像？" : "Why so many self-portraits?",
            zh ? "这些短笔触从哪里来？" : "Where do these short strokes come from?",
          ].map((suggestion) => (
            <button key={suggestion} onClick={() => ask(suggestion)}>
              {suggestion}
            </button>
          ))}
        </div>
        <form className="chat-form" onSubmit={submit}>
          <span className="eye-avatar tiny">
            <img src={props.imageUrl || ""} alt="" />
          </span>
          <textarea
            aria-label={zh ? "输入问题" : "Ask a question"}
            maxLength={240}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={zh ? "继续问梵高…" : "Ask Van Gogh…"}
            rows={1}
            value={question}
          />
          <button type="submit" aria-label={zh ? "发送" : "Send"}>
            ↗
          </button>
        </form>
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
        <span>SOURCES / 02</span>
        <h2>
          {zh ? (
            <>
              这段回答
              <br />
              从哪里来？
            </>
          ) : (
            <>
              Where did this
              <br />
              answer come from?
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
