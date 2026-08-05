"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { PageMessage, pageStateStyles } from "@/src/components/page-state";

export default function NotFound() {
  const pathname = usePathname();
  const locale = pathname === "/zh" || pathname.startsWith("/zh/") ? "zh" : "en";
  const text =
    locale === "zh"
      ? {
          title: "这里没有展厅。",
          body: "这个地址不存在，或对应页面已从正式体验中移除。",
          action: "返回首页",
        }
      : {
          title: "There is no gallery room here.",
          body: "This address does not exist, or the page has been removed from the public experience.",
          action: "Return home",
        };

  return (
    <PageMessage
      actions={
        <Link
          className={`${pageStateStyles.action} ${pageStateStyles.primary}`}
          href={`/${locale}`}
        >
          {text.action}
        </Link>
      }
      body={text.body}
      eyebrow="404 · CANVIUM"
      locale={locale}
      title={text.title}
    />
  );
}
