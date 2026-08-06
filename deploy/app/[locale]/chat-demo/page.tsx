import type { Metadata } from "next";

import { ChatScrollDemo } from "@/src/components/chat-scroll-demo";
import { isLocale } from "@/src/i18n/locales";
import { getReviewedPersonaOpening } from "@/src/lib/persona-openings";

export const metadata: Metadata = {
  title: "聊天阅读器 Demo",
  description: "Canvium 沉浸式作品聊天阅读器 Demo",
};

export default async function ChatDemoPage({ params }: PageProps<"/[locale]/chat-demo">) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;

  const opening = getReviewedPersonaOpening("artic:80607");
  if (!opening) return null;

  return <ChatScrollDemo opening={opening} />;
}
