"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/db";
import { MessageBubble } from "./MessageBubble";

export function MessageList({ messages, onBranch }: { messages: ChatMessage[]; onBranch: (message: ChatMessage) => void }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  return <div className="mx-auto w-full max-w-3xl px-3 pb-8 sm:px-5">{messages.map((message) => <MessageBubble key={message.id ?? `${message.createdAt}-${message.role}`} message={message} onBranch={onBranch} />)}<div ref={endRef} /></div>;
}
