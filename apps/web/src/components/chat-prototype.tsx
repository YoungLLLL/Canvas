"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";

import styles from "./chat-prototype.module.css";

const ARTWORK_IMAGE = "/chat/van-gogh-self-portrait-1889.jpg";
const ARTIST_EYE_IMAGE = "/chat/van-gogh-eye.jpg";

type Message = {
  id: number;
  role: "question" | "answer";
  chinese: string;
  english: string;
};

type ArtworkIdentityProps = {
  artist: string;
  year: string;
  title: string;
  medium: string;
  dimensions: string;
  collection: string;
};

const initialMessages: Message[] = [
  {
    id: 1,
    role: "question",
    chinese: "你是在哪一年画了这幅画？",
    english: "In what year did you paint this picture?",
  },
  {
    id: 2,
    role: "answer",
    chinese: "这一版《卧室》画于 1889 年。",
    english: "This version of “The Bedroom” was painted in 1889.",
  },
];

const suggestions = ["为什么房间看起来有些倾斜？", "你最喜欢画里的哪一种颜色？", "这幅画对你意味着什么？"];

function ArtworkIdentity({
  artist,
  year,
  title,
  medium,
  dimensions,
  collection,
}: ArtworkIdentityProps) {
  return (
    <dl className={styles.artworkCaption}>
      <div className={styles.artistLine}>
        <dt className="sr-only">Artist and year</dt>
        <dd>
          <strong>{artist}</strong>
          <span>{year}</span>
        </dd>
      </div>
      <div>
        <dt className="sr-only">Artwork title</dt>
        <dd>[ {title} ]</dd>
      </div>
      <div>
        <dt className="sr-only">Medium</dt>
        <dd>{medium}</dd>
      </div>
      <div>
        <dt className="sr-only">Dimensions</dt>
        <dd>{dimensions}</dd>
      </div>
      <div>
        <dt className="sr-only">Collection</dt>
        <dd>{collection}</dd>
      </div>
    </dl>
  );
}

function nextAnswer(question: string): Pick<Message, "chinese" | "english"> {
  if (/颜色|color/i.test(question)) {
    return {
      chinese: "我想让颜色替我说话：墙面的淡紫、床架的黄色，以及门窗的绿色，共同传达一种安静。",
      english:
        "I wanted color to speak for me: pale violet walls, the yellow bed, and green doors and windows create a sense of rest.",
    };
  }

  if (/倾斜|歪|perspective|tilt/i.test(question)) {
    return {
      chinese: "我有意简化了透视，让家具像色块一样彼此推挤。这里追求的并不是精确，而是一种亲密而直接的感觉。",
      english:
        "I simplified the perspective so the furniture presses together like blocks of color. The aim was intimacy, not precision.",
    };
  }

  return {
    chinese: "对我来说，这个房间是一处可以休息的地方。我用平涂的颜色和简洁的形状，试着画出一种安宁。",
    english:
      "To me, this room was a place of rest. With flat color and simple shapes, I tried to paint a feeling of calm.",
  };
}

export function ChatPrototype() {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [artworkScale, setArtworkScale] = useState(1);
  const [artworkOrigin, setArtworkOrigin] = useState({ x: 50, y: 50 });
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    feedRef.current?.scrollTo({
      top: feedRef.current.scrollHeight,
      behavior: messages.length > initialMessages.length ? "smooth" : "auto",
    });
  }, [messages]);

  function submitQuestion(event?: FormEvent) {
    event?.preventDefault();
    const question = draft.trim();
    if (!question) return;

    const baseId = Date.now();
    const answer = nextAnswer(question);
    setMessages((current) => [
      ...current,
      { id: baseId, role: "question", chinese: question, english: "" },
      { id: baseId + 1, role: "answer", ...answer },
    ]);
    setDraft("");
  }

  function zoomArtwork(event: React.WheelEvent<HTMLElement>) {
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    setArtworkOrigin({
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
    });
    setArtworkScale((current) => {
      const next = current + (event.deltaY < 0 ? 0.18 : -0.18);
      return Math.min(4, Math.max(1, Number(next.toFixed(2))));
    });
  }

  function resetArtwork() {
    setArtworkScale(1);
    setArtworkOrigin({ x: 50, y: 50 });
  }

  return (
    <main className={styles.page}>
      <section
        className={styles.artworkPanel}
        aria-label="Artwork information"
        onWheel={zoomArtwork}
      >
        {/* Public-domain reproduction sourced from Wikimedia Commons. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.artwork}
          src={ARTWORK_IMAGE}
          alt="Vincent van Gogh, Self-Portrait, 1887"
          style={{
            transform: `scale(${artworkScale})`,
            transformOrigin: `${artworkOrigin.x}% ${artworkOrigin.y}%`,
          }}
        />
        <div className={styles.artworkWash} />
        <Link className={styles.wordmark} href="/zh" aria-label="Return to Canvium home">
          Canvium
        </Link>
        <button
          className={styles.artworkReset}
          type="button"
          onClick={resetArtwork}
          disabled={artworkScale === 1}
          aria-label="将画作缩放复位到百分之百"
        >
          ↺ 复位
        </button>
        <ArtworkIdentity
          artist="Vincent Van Gogh"
          year="1889"
          title="THE BEDROOM"
          medium="OIL ON CANVAS"
          dimensions="72.4 × 91.3 CM"
          collection="ART INSTITUTE OF CHICAGO"
        />
      </section>

      <section className={styles.chatPanel} aria-label="Conversation with Vincent van Gogh">
        <header className={styles.chatHeader}>
          <div className={styles.titleLine}>
            <span className={styles.hash}>#</span>
            <h1>
              <b>CHAT</b> <span>With</span>
            </h1>
            <span className={styles.at}>@</span>
            <span className={styles.avatar}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ARTIST_EYE_IMAGE} alt="" />
            </span>
          </div>
          <div className={styles.quoteMarks} aria-hidden="true">
            <span>“</span>
            <span>”</span>
          </div>
        </header>

        <div className={styles.feed} ref={feedRef} aria-live="polite">
          {messages.map((message) => (
            <article
              className={`${styles.message} ${
                message.role === "question" ? styles.question : styles.answer
              }`}
              key={message.id}
            >
              <span className={styles.bracket} aria-hidden="true" />
              <div className={styles.messageBody}>
                <p className={styles.chinese}>
                  <b>{message.role === "question" ? "Q/" : "A/"}</b>
                  {message.chinese}
                  {message.role === "question" ? <i>?</i> : null}
                </p>
                {message.english ? (
                  <p className={styles.english}>
                    {message.id === 2 ? (
                      <>
                        This version of <mark>“The Bedroom”</mark> was painted in <mark>1889.</mark>
                      </>
                    ) : message.english}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>

        <div className={styles.composerArea}>
          <div className={styles.suggestions} aria-label="Suggested questions">
            {suggestions.map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => setDraft(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>
          <form className={styles.composer} onSubmit={submitQuestion}>
            <span className={styles.inputBracket} aria-hidden="true" />
            <label className="sr-only" htmlFor="chat-question">
              向梵高提问
            </label>
            <input
              id="chat-question"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="向 Vincent 提问…"
              autoComplete="off"
            />
            <button
              className={`${styles.voiceButton} ${isListening ? styles.listening : ""}`}
              type="button"
              aria-pressed={isListening}
              onClick={() => setIsListening((value) => !value)}
            >
              {isListening ? "聆听中" : "语音"}
            </button>
            <button className={styles.sendButton} type="submit" disabled={!draft.trim()}>
              发送
            </button>
          </form>
          <p className={styles.disclaimer}>AI 艺术家对话 · 回答基于馆藏资料与经审核的人格档案</p>
        </div>
      </section>
    </main>
  );
}
