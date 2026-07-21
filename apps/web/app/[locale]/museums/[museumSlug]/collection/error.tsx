"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CollectionError({ unstable_retry }: { unstable_retry: () => void }) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] === "zh" ? "zh" : "en";
  const text =
    locale === "zh"
      ? {
          eyebrow: "馆藏暂时不可用",
          title: "暂时无法连接馆方数据。",
          body: "这不是空结果，也不表示作品已被撤下。你可以重试或返回博物馆。",
          retry: "重试",
          back: "返回博物馆",
        }
      : {
          eyebrow: "Collection unavailable",
          title: "The museum data cannot be reached right now.",
          body: "This is not an empty result and does not mean an artwork was withdrawn. Try again or return to the museum.",
          retry: "Try again",
          back: "Return to the museum",
        };

  return (
    <main className="shell page">
      <p className="eyebrow">{text.eyebrow}</p>
      <h1 className="title">{text.title}</h1>
      <p className="lede">{text.body}</p>
      <div className="actions">
        <button className="button button-primary" onClick={() => unstable_retry()} type="button">
          {text.retry}
        </button>
        <Link className="button" href={`/${locale}/museums/art-institute-of-chicago`}>
          {text.back}
        </Link>
      </div>
    </main>
  );
}
