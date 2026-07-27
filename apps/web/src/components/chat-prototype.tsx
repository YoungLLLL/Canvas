"use client";

import { FormEvent, PointerEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";

import styles from "./chat-prototype.module.css";

const ARTWORK_IMAGE = "/chat/van-gogh-self-portrait-1889.jpg";

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
    chinese: "你是在哪一年画了这幅画",
    english: "In what year did you paint this picture?",
  },
  {
    id: 2,
    role: "answer",
    chinese: "这一版《卧室》画于1889年。",
    english: "This version of “The Bedroom” was painted in 1889.",
  },
];

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
      chinese:
        "我有意简化了透视，让家具像色块一样彼此推挤。这里追求的并不是精确，而是一种亲密而直接的感觉。",
      english:
        "I simplified the perspective so the furniture presses together like blocks of color. The aim was intimacy, not precision.",
    };
  }

  return {
    chinese:
      "对我来说，这个房间是一处可以休息的地方。我用平涂的颜色和简洁的形状，试着画出一种安宁。",
    english:
      "To me, this room was a place of rest. With flat color and simple shapes, I tried to paint a feeling of calm.",
  };
}

export function ChatPrototype() {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isComposerExpanded, setIsComposerExpanded] = useState(false);
  const [artworkScale, setArtworkScale] = useState(1);
  const [artworkOrigin, setArtworkOrigin] = useState({ x: 50, y: 50 });
  const [artworkOffset, setArtworkOffset] = useState({ x: 0, y: 0 });
  const [isDraggingArtwork, setIsDraggingArtwork] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const composerInputRef = useRef<HTMLInputElement>(null);
  const artworkDragRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    if (messages.length > initialMessages.length) {
      feedRef.current?.scrollTo({
        top: feedRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    if (isComposerExpanded && !isListening) {
      composerInputRef.current?.focus({ preventScroll: true });
    }
  }, [isComposerExpanded, isListening]);

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
    setIsComposerExpanded(false);
  }

  function zoomArtwork(event: React.WheelEvent<HTMLElement>) {
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    const nextScale = Math.min(
      4,
      Math.max(1, Number((artworkScale + (event.deltaY < 0 ? 0.18 : -0.18)).toFixed(2))),
    );

    setArtworkOrigin({
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
    });
    setArtworkScale(nextScale);
    if (nextScale === 1) {
      setArtworkOrigin({ x: 50, y: 50 });
      setArtworkOffset({ x: 0, y: 0 });
    }
  }

  function resetArtwork() {
    setArtworkScale(1);
    setArtworkOrigin({ x: 50, y: 50 });
    setArtworkOffset({ x: 0, y: 0 });
  }

  function startArtworkDrag(event: PointerEvent<HTMLImageElement>) {
    if (artworkScale === 1 || event.button !== 0) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    artworkDragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    setIsDraggingArtwork(true);
  }

  function dragArtwork(event: PointerEvent<HTMLImageElement>) {
    const drag = artworkDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.x;
    const deltaY = event.clientY - drag.y;
    artworkDragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    setArtworkOffset((current) => ({
      x: current.x + deltaX,
      y: current.y + deltaY,
    }));
  }

  function stopArtworkDrag(event: PointerEvent<HTMLImageElement>) {
    if (artworkDragRef.current?.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    artworkDragRef.current = null;
    setIsDraggingArtwork(false);
  }

  function handleComposerAction() {
    if (isListening) {
      setIsListening(false);
      setIsComposerExpanded(true);
      return;
    }

    if (draft.trim()) {
      submitQuestion();
      return;
    }

    setIsComposerExpanded(true);
    setIsListening(true);
  }

  function collapseEmptyComposer() {
    if (!draft.trim() && !isListening) {
      composerInputRef.current?.blur();
      setIsComposerExpanded(false);
    }
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
          className={`${styles.artwork} ${
            artworkScale > 1 ? styles.artworkDraggable : ""
          } ${isDraggingArtwork ? styles.artworkDragging : ""}`}
          src={ARTWORK_IMAGE}
          alt="Vincent van Gogh, Self-Portrait, 1887"
          draggable={false}
          onPointerDown={startArtworkDrag}
          onPointerMove={dragArtwork}
          onPointerUp={stopArtworkDrag}
          onPointerCancel={stopArtworkDrag}
          style={{
            transform: `translate3d(${artworkOffset.x}px, ${artworkOffset.y}px, 0) scale(${artworkScale})`,
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
          <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
            <path d="M3 3v5h5" />
          </svg>
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
          <h1 className={styles.artistProfile}>
            <span className={styles.profileLine}>
              Vincent Van Gogh
              <span className={styles.profileEye} aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ARTWORK_IMAGE} alt="" />
              </span>
              文森特·梵高
            </span>
            <span className={styles.profileLine}>Born: 1853, The Netherlands 荷兰</span>
            <span className={styles.profileLine}>Style: Bold Colors 浓烈色彩, Expressive</span>
            <span className={styles.profileLine}>Brushstrokes 情绪化笔触 Subjects:</span>
            <span className={styles.profileLine}>Sunflowers 向日葵, Starry Nights 星空</span>
            <span className={styles.profileLine}>Legacy: Forever Changed Modern Art</span>
            <span className={styles.profileLine}>永远改变了现代艺术。</span>
          </h1>
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
                {message.role === "answer" && message.english ? (
                  <>
                    <p className={styles.english}>
                      <b>A/</b>
                      {message.id === 2 ? (
                        <>
                          This version of <mark>“The Bedroom”</mark> was painted in{" "}
                          <mark>1889.</mark>
                        </>
                      ) : (
                        message.english
                      )}
                    </p>
                    <p className={styles.chinese}>{message.chinese}</p>
                  </>
                ) : (
                  <>
                    <p className={styles.chinese}>
                      <b>Q/</b>
                      {message.chinese.replace(/[？?]\s*$/, "")}
                      <i>?</i>
                    </p>
                    {message.english ? <p className={styles.english}>{message.english}</p> : null}
                  </>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className={styles.composerArea}>
          <form
            className={`${styles.composer} ${
              isComposerExpanded || isListening || draft.trim() ? styles.composerExpanded : ""
            }`}
            onSubmit={submitQuestion}
            onMouseLeave={collapseEmptyComposer}
          >
            <span className={styles.inputBracket} aria-hidden="true" />
            {!isComposerExpanded && !isListening && !draft.trim() ? (
              <span className={styles.composerHint} aria-hidden="true">
                <svg className={styles.actionIcon} focusable="false" viewBox="0 0 24 24">
                  <path d="M7 17 17 7" />
                  <path d="M8 7h9v9" />
                </svg>
              </span>
            ) : null}
            <div className={styles.composerSurface}>
              {isListening ? (
                <div className={styles.listeningStage} aria-hidden="true">
                  <span className={styles.voiceWave}>
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </span>
                </div>
              ) : !isComposerExpanded && !draft.trim() ? (
                <button
                  className={styles.composerSeed}
                  type="button"
                  aria-label="展开文字输入框"
                  onClick={() => setIsComposerExpanded(true)}
                >
                  <span className={styles.seedDot} aria-hidden="true" />
                </button>
              ) : (
                <>
                  <label className="sr-only" htmlFor="chat-question">
                    向梵高提问
                  </label>
                  <input
                    ref={composerInputRef}
                    id="chat-question"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    autoComplete="off"
                  />
                </>
              )}
              {isComposerExpanded || isListening || draft.trim() ? (
                <button
                  className={`${styles.composerAction} ${
                    isListening ? styles.listening : draft.trim() ? styles.readyToSend : ""
                  }`}
                  type="button"
                  aria-pressed={isListening}
                  aria-label={
                    isListening ? "停止语音输入" : draft.trim() ? "发送消息" : "开始语音输入"
                  }
                  onClick={handleComposerAction}
                >
                  {isListening ? (
                    <span className={styles.stopIcon} aria-hidden="true" />
                  ) : draft.trim() ? (
                    <svg
                      className={styles.actionIcon}
                      aria-hidden="true"
                      focusable="false"
                      viewBox="0 0 24 24"
                    >
                      <path d="M7 17 17 7" />
                      <path d="M8 7h9v9" />
                    </svg>
                  ) : (
                    <svg
                      className={styles.actionIcon}
                      aria-hidden="true"
                      focusable="false"
                      viewBox="0 0 24 24"
                    >
                      <path d="M7 17 17 7" />
                      <path d="M8 7h9v9" />
                    </svg>
                  )}
                </button>
              ) : null}
            </div>
            <span
              className={`${styles.inputBracket} ${styles.inputBracketRight}`}
              aria-hidden="true"
            />
          </form>
          <p className={styles.disclaimer}>AI 艺术家对话 · 回答基于馆藏资料与经审核的人格档案</p>
        </div>
      </section>
    </main>
  );
}
