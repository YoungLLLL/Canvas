"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./page-state.module.css";

export function PageLoadingState({
  dark = false,
  label,
  locale,
}: {
  dark?: boolean;
  label: string;
  locale?: "en" | "zh";
}) {
  const pathname = usePathname();
  const activeLocale = locale ?? (pathname === "/zh" || pathname.startsWith("/zh/") ? "zh" : "en");
  return (
    <main
      aria-label={label}
      aria-live="polite"
      className={`${styles.root}${dark ? ` ${styles.dark}` : ""}`}
      role="status"
    >
      <Link className={styles.wordmark} href={`/${activeLocale}`}>
        Canvium
      </Link>
      <div className={styles.content}>
        <span className={styles.eyebrow}>CANVIUM · DIGITAL GALLERY</span>
        <div aria-hidden="true" className={styles.loadingMark}>
          <i />
          <i />
          <i />
        </div>
        <p className={styles.body}>{label}</p>
      </div>
      <small className={styles.meta}>
        {activeLocale === "zh" ? "正在准备页面" : "Preparing page"}
      </small>
    </main>
  );
}

export function PageMessage({
  actions,
  body,
  eyebrow,
  locale,
  title,
}: {
  actions: React.ReactNode;
  body: string;
  eyebrow: string;
  locale: "en" | "zh";
  title: string;
}) {
  return (
    <main className={styles.root}>
      <Link className={styles.wordmark} href={`/${locale}`}>
        Canvium
      </Link>
      <div className={styles.content}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.body}>{body}</p>
        <div className={styles.actions}>{actions}</div>
      </div>
      <small className={styles.meta}>CANVIUM GALLERY</small>
    </main>
  );
}

export const pageStateStyles = styles;
