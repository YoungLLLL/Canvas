"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { PageMessage, pageStateStyles } from "@/src/components/page-state";

export default function CollectionError({ unstable_retry }: { unstable_retry: () => void }) {
  const pathname = usePathname();
  const locale = pathname === "/zh" || pathname.startsWith("/zh/") ? "zh" : "en";
  const text =
    locale === "zh"
      ? {
          eyebrow: "COLLECTION · ERROR",
          title: "馆藏暂时无法打开。",
          body: "馆方数据连接失败。你可以重试，或返回首页继续探索。",
          retry: "重试",
          back: "返回首页",
        }
      : {
          eyebrow: "COLLECTION · ERROR",
          title: "The collection could not be opened.",
          body: "The museum data connection failed. Try again, or return home to keep exploring.",
          retry: "Try again",
          back: "Return home",
        };

  return (
    <PageMessage
      actions={
        <>
          <button
            className={`${pageStateStyles.action} ${pageStateStyles.primary}`}
            onClick={() => unstable_retry()}
            type="button"
          >
            {text.retry}
          </button>
          <Link className={pageStateStyles.action} href={`/${locale}#museum`}>
            {text.back}
          </Link>
        </>
      }
      body={text.body}
      eyebrow={text.eyebrow}
      locale={locale}
      title={text.title}
    />
  );
}
