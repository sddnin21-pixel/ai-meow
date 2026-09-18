import type { ChatMessage, Conversation } from "./db";

export function conversationToMarkdown(conversation: Conversation, messages: ChatMessage[]): string {
  const lines = [`# ${conversation.title}`, "", `Provider: ${conversation.provider}`, `Model: ${conversation.model}`, ""];
  for (const message of messages.sort((a, b) => a.createdAt - b.createdAt)) {
    lines.push(`## ${message.role === "user" ? "Bạn" : message.role === "assistant" ? "AI Meow" : "System"}`);
    lines.push("", message.content.trim(), "");
  }
  return lines.join("\n");
}

export function markdownToHtml(markdown: string): string {
  const escaped = markdown.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AI Meow</title><style>body{font-family:system-ui,sans-serif;max-width:900px;margin:40px auto;padding:0 20px;color:#2d2416;line-height:1.65;white-space:pre-wrap}h1{color:#c56d00}</style></head><body>${escaped}</body></html>`;
}

export function downloadText(filename: string, content: string, type = "text/plain;charset=utf-8"): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
