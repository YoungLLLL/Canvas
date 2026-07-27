import type { Metadata } from "next";

import { ChatPrototype } from "@/src/components/chat-prototype";

export const metadata: Metadata = {
  title: "Chat Prototype",
  description: "A standalone prototype for the Canvium artist conversation experience.",
};

export default function ChatPreviewPage() {
  return <ChatPrototype />;
}
