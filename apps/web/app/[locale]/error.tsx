"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { PageMessage, pageStateStyles } from "@/src/components/page-state";

export default function LocaleError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const pathname = usePathname();
  const locale = pathname === "/zh" || pathname.startsWith("/zh/") ? "zh" : "en";
  useEffect(() => console.error(error), [error]);
  const text =
    locale === "zh"
      ? {
          title: "页面暂时无法打开。",
          body: "请稍后重试，或返回 Canvium 首页。",
          retry: "重新尝试",
        }
      : {
          title: "This page could not be opened.",
          body: "Try again in a moment, or return to the Canvium home page.",
          retry: "Try again",
        };

  return (
    <PageMessage
      actions={
        <button
          className={`${pageStateStyles.action} ${pageStateStyles.primary}`}
          onClick={() => unstable_retry()}
          type="button"
        >
          {text.retry}
        </button>
      }
      body={text.body}
      eyebrow="ERROR · CANVIUM"
      locale={locale}
      title={text.title}
    />
  );
}
