"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { FormEvent, MouseEvent, useEffect, useRef, useState } from "react";

import { CollectionBackLink } from "@/src/components/collection-state";

import styles from "./chat-scroll-demo.module.css";

export type ChatCitation = {
  number: number;
  title: string;
  publisher: string;
  url: string;
  locator?: Record<string, string>;
  excerpt?: string;
  supportText?: string;
};

export type ChatSegment = {
  chinese: string;
  english: string;
  citationNumbers: number[];
};

export type ChatScrollOpening = {
  chinese: string;
  english: string;
  responseType?: "imagined_response";
  citations?: ChatCitation[];
  segments?: ChatSegment[];
};

export type ImmersiveArtwork = {
  imageUrl: string | null;
  artist: string;
  localizedArtist?: string;
  year: string;
  title: string;
  localizedTitle?: string;
  medium: string;
  localizedMedium?: string;
  dimensions: string;
  collection: string;
  localizedCollection?: string;
};

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  chinese: string;
  english?: string;
  citations?: ChatCitation[];
  segments?: ChatSegment[];
};

type ChatScrollDemoProps = {
  locale?: "en" | "zh";
  artworkId?: string;
  collectionHref?: string;
  opening?: ChatScrollOpening;
  artwork?: Partial<ImmersiveArtwork>;
};

const DEFAULT_ARTWORK: ImmersiveArtwork = {
  imageUrl: "/chat/van-gogh-self-portrait-1889.jpg",
  artist: "Vincent Van Gogh",
  localizedArtist: "文森特·梵高",
  year: "1889",
  title: "THE BEDROOM",
  localizedTitle: "《卧室》",
  medium: "OIL ON CANVAS",
  localizedMedium: "油画 · 画布",
  dimensions: "72.4 × 91.3 CM",
  collection: "ART INSTITUTE OF CHICAGO",
  localizedCollection: "芝加哥艺术学院",
};

function SquareArrow({ className }: { className?: string }) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path d="M4 20 20 4" />
      <path d="M6 4h14v14" />
    </svg>
  );
}

function annotationPosition(event: MouseEvent<HTMLButtonElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  const width = Math.min(300, window.innerWidth - 24);
  const estimatedHeight = 220;
  const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));
  const below = rect.bottom + 10;
  const top =
    below + estimatedHeight <= window.innerHeight - 12
      ? below
      : Math.max(12, rect.top - estimatedHeight - 10);
  return { top, left };
}

function localizedValue(primary: string, localized?: string) {
  if (!localized || localized.trim().toLocaleLowerCase() === primary.trim().toLocaleLowerCase()) {
    return null;
  }
  return localized;
}

export function ChatScrollDemo({
  locale = "zh",
  artworkId,
  collectionHref,
  opening,
  artwork,
}: ChatScrollDemoProps) {
  const selectedArtwork: ImmersiveArtwork = {
    ...DEFAULT_ARTWORK,
    ...artwork,
    imageUrl:
      artwork && Object.prototype.hasOwnProperty.call(artwork, "imageUrl")
        ? artwork.imageUrl || null
        : DEFAULT_ARTWORK.imageUrl,
    localizedArtist: artwork ? artwork.localizedArtist : DEFAULT_ARTWORK.localizedArtist,
    localizedTitle: artwork ? artwork.localizedTitle : DEFAULT_ARTWORK.localizedTitle,
    localizedMedium: artwork ? artwork.localizedMedium : DEFAULT_ARTWORK.localizedMedium,
    localizedCollection: artwork
      ? artwork.localizedCollection
      : DEFAULT_ARTWORK.localizedCollection,
  };
  const messageFeedRef = useRef<HTMLDivElement>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [introReady, setIntroReady] = useState(false);
  const [draft, setDraft] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [chatError, setChatError] = useState("");
  const [activeAnnotation, setActiveAnnotation] = useState<{
    messageId: number;
    number: number;
  } | null>(null);
  const [annotationPopoverPosition, setAnnotationPopoverPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const initialOpening: ChatScrollOpening = opening || {
    chinese: `先别急着寻找结论，看看《${selectedArtwork.title}》最先把你的目光带到了哪里。`,
    english: `Before looking for a conclusion, notice where ${selectedArtwork.title} first takes your eye.`,
  };
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      chinese: initialOpening.chinese,
      english: initialOpening.english,
      citations: initialOpening.citations,
      segments: initialOpening.segments,
    },
  ]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIntroReady(true);
      setChatOpen(true);
    }, 1600);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!chatOpen) return;
    const frame = window.requestAnimationFrame(() => {
      if (messages.length === 1) {
        messageFeedRef.current?.scrollTo({ top: 0 });
      } else {
        messageFeedRef.current?.scrollTo({
          top: messageFeedRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [chatOpen, messages.length]);

  useEffect(() => {
    if (!activeAnnotation) return;
    const closeAnnotation = () => {
      setActiveAnnotation(null);
      setAnnotationPopoverPosition(null);
    };
    window.addEventListener("resize", closeAnnotation);
    window.addEventListener("scroll", closeAnnotation, true);
    return () => {
      window.removeEventListener("resize", closeAnnotation);
      window.removeEventListener("scroll", closeAnnotation, true);
    };
  }, [activeAnnotation]);

  async function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = draft.trim();
    if (!question || isReplying) return;

    const baseId = Date.now();
    const history = messages.slice(-10).map((message) => ({
      role: message.role === "user" ? ("user" as const) : ("assistant" as const),
      content: message.chinese,
    }));
    setMessages((current) => [...current, { id: baseId, role: "user", chinese: question }]);
    setDraft("");
    setChatError("");
    setIsReplying(true);

    if (!artworkId) {
      window.setTimeout(() => {
        setMessages((current) => [
          ...current,
          {
            id: baseId + 1,
            role: "assistant",
            chinese:
              "可以先从笔触开始看：颜色并不是平静地停在画布上，而是在轮廓与背景之间持续流动。",
            english:
              "Begin with the brushwork: color does not sit still, but keeps moving between the figure and the ground.",
          },
        ]);
        setIsReplying(false);
      }, 750);
      return;
    }

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artworkId, message: question, history }),
      });
      const body = (await response.json()) as {
        answer?: string;
        englishAnswer?: string;
        citations?: ChatCitation[];
        displaySegments?: ChatSegment[];
        error?: string;
      };
      if (!response.ok || !body.answer || !body.englishAnswer) {
        throw new Error(body.error || "暂时无法生成回答。");
      }
      setMessages((current) => [
        ...current,
        {
          id: baseId + 1,
          role: "assistant",
          chinese: body.answer!,
          english: body.englishAnswer!,
          citations: body.citations,
          segments: body.displaySegments,
        },
      ]);
    } catch (error) {
      setChatError(error instanceof Error ? error.message : "暂时无法生成回答。");
    } finally {
      setIsReplying(false);
    }
  }

  function renderCitationMarker(message: ChatMessage, number: number, key: string) {
    const citation = message.citations?.find((candidate) => candidate.number === number);
    if (!citation) return null;
    const isOpen = activeAnnotation?.messageId === message.id && activeAnnotation.number === number;
    return (
      <span className={styles.annotationAnchor} key={key}>
        <button
          className={styles.annotationMarker}
          type="button"
          aria-expanded={isOpen}
          aria-label={`打开注释 ${number}`}
          onClick={(event) => {
            if (isOpen) {
              setActiveAnnotation(null);
              setAnnotationPopoverPosition(null);
              return;
            }
            setActiveAnnotation({ messageId: message.id, number });
            setAnnotationPopoverPosition(annotationPosition(event));
          }}
        >
          {number}
        </button>
        {isOpen ? (
          <span
            className={styles.annotationPopover}
            role="status"
            style={annotationPopoverPosition || undefined}
          >
            <strong>{citation.publisher || "资料来源"}</strong>
            <span>{citation.title || `引用 ${number}`}</span>
            <span>{citation.supportText || citation.excerpt}</span>
            {citation.url ? (
              <a href={citation.url} target="_blank" rel="noreferrer">
                查看来源 ↗
              </a>
            ) : null}
          </span>
        ) : null}
      </span>
    );
  }

  function renderEnglish(message: ChatMessage) {
    if (!message.english) return null;
    if (!message.segments?.length) return message.english;
    return message.segments.map((segment, segmentIndex) => (
      <span key={`${message.id}-segment-${segmentIndex}`}>
        {segment.english}
        {segment.citationNumbers.map((number, citationIndex) =>
          renderCitationMarker(
            message,
            number,
            `${message.id}-${segmentIndex}-${citationIndex}-${number}`,
          ),
        )}
        {segmentIndex < message.segments!.length - 1 ? " " : null}
      </span>
    ));
  }

  const localizedArtist = localizedValue(selectedArtwork.artist, selectedArtwork.localizedArtist);
  const localizedTitle = localizedValue(selectedArtwork.title, selectedArtwork.localizedTitle);
  const localizedMedium = localizedValue(selectedArtwork.medium, selectedArtwork.localizedMedium);
  const localizedCollection = localizedValue(
    selectedArtwork.collection,
    selectedArtwork.localizedCollection,
  );

  return (
    <main className={styles.page}>
      <div className={styles.artworkCanvas}>
        {selectedArtwork.imageUrl ? (
          <img
            className={styles.artworkImage}
            src={selectedArtwork.imageUrl}
            alt={`${selectedArtwork.artist}, ${selectedArtwork.title}`}
            draggable={false}
          />
        ) : (
          <div className={styles.artworkUnavailable} role="status">
            {locale === "zh" ? "该馆藏记录暂无可展示图像" : "No displayable image"}
          </div>
        )}
        <div className={styles.artworkWash} aria-hidden="true" />
      </div>

      <header className={styles.topBar}>
        <Link
          className={styles.wordmark}
          href={`/${locale}`}
          aria-label={locale === "zh" ? "返回 Canvium 首页" : "Return to Canvium home"}
        >
          Canvium
        </Link>
      </header>

      <CollectionBackLink
        className={styles.galleryExit}
        defaultHref={collectionHref ?? `/${locale}/museums/art-institute-of-chicago/collection`}
        label={locale === "zh" ? "返回画廊" : "Return to the gallery"}
      >
        <span aria-hidden="true">←</span>
      </CollectionBackLink>

      <section className={styles.chatDock} aria-label="与作品对话">
        <div className={`${styles.chatShell} ${chatOpen ? styles.chatShellOpen : ""}`}>
          <div className={styles.chatSurface} role="dialog" aria-label="与 Canvium 对话">
            <div className={styles.glassGlow} aria-hidden="true" />
            <header className={styles.chatHeader}>
              <button
                className={styles.chatTitle}
                type="button"
                onClick={() => setChatOpen((current) => !current)}
                aria-label={chatOpen ? "收起聊天" : "打开作品聊天"}
                aria-expanded={chatOpen}
                aria-busy={!introReady}
              >
                <SquareArrow className={styles.squareArrow} />
                <span>Talk with ...</span>
              </button>
            </header>

            <div className={styles.chatBody} aria-hidden={!chatOpen}>
              <div className={styles.messageFeed} aria-live="polite" ref={messageFeedRef}>
                {messages.map((message) => (
                  <article
                    className={`${styles.message} ${
                      message.role === "user" ? styles.userMessage : styles.assistantMessage
                    }`}
                    key={message.id}
                  >
                    {message.role === "assistant" ? (
                      <>
                        <p>
                          <span className={styles.messageMarker} aria-hidden="true">
                            A/
                          </span>
                          {renderEnglish(message)}
                        </p>
                        <p className={styles.chineseMessage}>{message.chinese}</p>
                      </>
                    ) : (
                      <p>
                        <span className={styles.messageMarker} aria-hidden="true">
                          Q/
                        </span>
                        {message.chinese}
                      </p>
                    )}
                  </article>
                ))}
                {isReplying ? (
                  <div className={styles.replying} aria-label="正在生成回答">
                    <span />
                    <span />
                    <span />
                  </div>
                ) : null}
              </div>

              <form className={styles.composer} onSubmit={submitQuestion}>
                <label className="sr-only" htmlFor="chat-question">
                  {locale === "zh" ? "输入问题" : "Enter a question"}
                </label>
                <input
                  id="chat-question"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  disabled={isReplying}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  aria-label={locale === "zh" ? "发送问题" : "Send question"}
                  disabled={!draft.trim() || isReplying}
                >
                  <SquareArrow className={styles.squareArrow} />
                </button>
              </form>
              {chatError ? (
                <p className={styles.chatError} role="alert">
                  {chatError}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <aside className={styles.artworkCaption} aria-label="作品信息">
        <div className={styles.artistLine}>
          <em>{selectedArtwork.artist}</em>
          <span>/ {selectedArtwork.year}</span>
          {localizedArtist ? <span>{localizedArtist}</span> : null}
        </div>
        <div className={styles.captionLine}>
          [{selectedArtwork.title.toUpperCase()}]
          {localizedTitle ? <span>{localizedTitle}</span> : null}
        </div>
        <div className={styles.captionLine}>
          {selectedArtwork.medium.toUpperCase()}
          {localizedMedium ? <span>{localizedMedium}</span> : null}
        </div>
        <div>{selectedArtwork.dimensions.toUpperCase()}</div>
        <div className={styles.captionLine}>
          {selectedArtwork.collection.toUpperCase()}
          {localizedCollection ? <span>{localizedCollection}</span> : null}
        </div>
      </aside>
    </main>
  );
}
