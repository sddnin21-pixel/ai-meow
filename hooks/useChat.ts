"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { db, type ChatMessage, type ToolCallRecord } from "@/lib/db";
import { useSettings } from "@/hooks/useSettings";
import { encryptSecret, decryptSecret, type EncryptedValue } from "@/lib/crypto";
import { fallbackTitle } from "@/lib/auto-title";

interface ChatAttachment { name: string; type: string; text: string; base64?: string; blob: Blob; }
interface SendOptions { conversationId: number; text: string; attachments?: ChatAttachment[]; }

export function useChat(conversationId?: number) {
  const { settings } = useSettings();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!conversationId) { setMessages([]); return; }
    let cancelled = false;
    void db.messages.where("conversationId").equals(conversationId).sortBy("createdAt").then((rows) => { if (!cancelled) setMessages(rows); });
    return () => { cancelled = true; };
  }, [conversationId]);

  const resolveKey = useCallback(async (): Promise<string | undefined> => {
    const item = settings.provider.keys[settings.provider.active];
    const enc = item?.apiKeyEnc as EncryptedValue | undefined;
    if (!enc) return undefined;
    const passphrase = sessionStorage.getItem("ai-meow-passphrase");
    if (!passphrase) return undefined;
    try { return await decryptSecret(enc, passphrase); } catch { return undefined; }
  }, [settings.provider]);

  const ensureRate = useCallback(async () => {
    const row = await db.settings.get("local-rate-limit");
    const now = Date.now();
    const current = row?.value as { startedAt: number; count: number } | undefined;
    if (!current || now - current.startedAt >= 60_000) {
      await db.settings.put({ key: "local-rate-limit", value: { startedAt: now, count: 1 } });
      return true;
    }
    if (current.count >= settings.tools.rateLimit) return false;
    await db.settings.put({ key: "local-rate-limit", value: { ...current, count: current.count + 1 } });
    return true;
  }, [settings.tools.rateLimit]);

  const send = useCallback(async ({ conversationId: id, text, attachments = [] }: SendOptions) => {
    if (!text.trim() || streaming) return;
    const allowed = await ensureRate();
    if (!allowed) { toast.error("Đã vượt rate limit local. Hãy chờ một phút."); return; }

    const now = Date.now();
    const userMessage: ChatMessage = { conversationId: id, role: "user", content: text.trim(), createdAt: now, attachments: attachments.map((item) => item.name) };
    const userId = await db.messages.add(userMessage);
    if (attachments.length > 0) {
      await db.attachments.bulkAdd(attachments.map((attachment) => ({ messageId: userId, name: attachment.name, type: attachment.type, size: attachment.blob.size, blob: attachment.blob, extractedText: attachment.text })));
    }
    setMessages((previous) => [...previous, { ...userMessage, id: userId }]);
    await db.conversations.update(id, { updatedAt: now });

    const controller = new AbortController();
    abortRef.current = controller;
    setStreaming(true);
    const assistantMessage: ChatMessage = { conversationId: id, role: "assistant", content: "", createdAt: Date.now(), toolCalls: [] };
    const assistantId = await db.messages.add(assistantMessage);
    setMessages((previous) => [...previous, { ...assistantMessage, id: assistantId }]);

    try {
      const apiKey = await resolveKey();
      const prior = [...messages, userMessage].map((message) => ({ role: message.role, content: message.content }));
      const enriched = [...prior, ...attachments.map((attachment) => ({ role: "user" as const, content: `[File: ${attachment.name}]\n${attachment.text}` }))];
      const response = await fetch("/api/chat", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: enriched, provider: settings.provider.active, model: settings.model.name, apiKey, baseUrl: settings.provider.keys[settings.provider.active]?.baseUrl, toolsEnabled: settings.tools.webSearch || settings.tools.fileWriter, reasoning: settings.reasoning, temperature: settings.model.temperature, maxTokens: settings.model.maxTokens, topP: settings.model.topP, rateLimit: settings.tools.rateLimit })
      });
      if (!response.ok) {
        const data: unknown = await response.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? `API ${response.status}`);
      }
      if (!response.body) throw new Error("Provider không trả stream.");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let content = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        content += decoder.decode(value, { stream: true });
        setMessages((previous) => previous.map((item) => item.id === assistantId ? { ...item, content } : item));
        await db.messages.update(assistantId, { content });
      }
      await db.messages.update(assistantId, { content, tokens: Math.ceil(content.length / 4) });
      setMessages((previous) => previous.map((item) => item.id === assistantId ? { ...item, content, tokens: Math.ceil(content.length / 4) } : item));
      const conversation = await db.conversations.get(id);
      if (conversation?.title === "Cuộc trò chuyện mới") {
        const title = fallbackTitle(text);
        await db.conversations.update(id, { title, updatedAt: Date.now() });
      }
      if (settings.tts.enabled) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(content);
        utterance.lang = settings.language === "vi" ? "vi-VN" : "en-US";
        utterance.rate = settings.tts.rate;
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        await db.messages.update(assistantId, { content: "[Đã dừng]" });
        setMessages((previous) => previous.map((item) => item.id === assistantId ? { ...item, content: "[Đã dừng]" } : item));
      } else {
        const message = error instanceof Error ? error.message : "Lỗi không xác định";
        await db.messages.update(assistantId, { content: `Xin lỗi, Meow gặp lỗi: ${message}` });
        setMessages((previous) => previous.map((item) => item.id === assistantId ? { ...item, content: `Xin lỗi, Meow gặp lỗi: ${message}` } : item));
        toast.error(message);
      }
    } finally {
      abortRef.current = null;
      setStreaming(false);
    }
  }, [ensureRate, messages, resolveKey, settings, streaming]);

  const stop = useCallback(() => abortRef.current?.abort(), []);

  return { messages, send, stop, streaming };
}

export async function saveApiKey(provider: string, secret: string, passphrase: string): Promise<EncryptedValue> {
  return encryptSecret(secret, passphrase);
}
