"use client";

import { Moon, Search, Settings2, Sparkles, Sun, Volume2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Button } from "@/components/ui/Button";
import { useConversations } from "@/hooks/useConversations";
import { useChat } from "@/hooks/useChat";
import { useSettings } from "@/hooks/useSettings";
import { useKeyboard } from "@/hooks/useKeyboard";
import { db, createConversation, type ChatMessage } from "@/lib/db";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { CommandPalette } from "@/components/command/CommandPalette";
import { toast } from "sonner";
import type { PreparedAttachment } from "./FileUpload";

const suggestions = ["🔍 Tìm tin tức công nghệ hôm nay", "📝 Viết blog về mèo", "📊 Bảng so sánh iPhone vs Samsung", "💡 Giải thích AI cho trẻ 10 tuổi"];

export function ChatContainer() {
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [zen, setZen] = useState(false);
  const [palette, setPalette] = useState(false);
  const [webSearch, setWebSearch] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const { settings, update } = useSettings();
  const { conversations, activeId, setActiveId, newChat, remove } = useConversations();
  const { messages, send, stop, streaming } = useChat(activeId);
  const activeConversation = useMemo(() => conversations.find((item) => item.id === activeId), [activeId, conversations]);

  useEffect(() => {
    const stored = localStorage.getItem("ai-meow-theme");
    const preferred = stored === "dark" ? "dark" : stored === "light" ? "light" : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    setTheme(preferred);
    document.documentElement.classList.toggle("dark", preferred === "dark");
  }, []);
  useEffect(() => { if (!activeId && conversations.length === 0) void newChat(); }, [activeId, conversations.length, newChat]);
  useEffect(() => { void update({ tools: { ...settings.tools, webSearch } }); }, [webSearch]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next); localStorage.setItem("ai-meow-theme", next); document.documentElement.classList.toggle("dark", next === "dark");
  };

  const branch = async (message: ChatMessage) => {
    const id = await createConversation({ title: `Nhánh · ${message.content.slice(0, 24)}`, model: activeConversation?.model ?? settings.model.name, provider: activeConversation?.provider ?? settings.provider.active });
    const context = messages.filter((item) => (item.createdAt <= message.createdAt)).map((item) => ({ ...item, id: undefined, conversationId: id }));
    if (context.length) await db.messages.bulkAdd(context);
    setActiveId(id); toast.success("Đã tạo nhánh hội thoại.");
  };

  useKeyboard({ "Ctrl+k": () => setPalette(true), "Meta+k": () => setPalette(true), Escape: () => { setPalette(false); if (zen) setZen(false); } });

  const sendMessage = async (text: string, attachments: PreparedAttachment[]) => {
    if (!activeId) { const id = await newChat(); if (id) await send({ conversationId: id, text, attachments }); return; }
    await send({ conversationId: activeId, text, attachments });
  };

  return <div className="flex h-[100dvh] overflow-hidden bg-background">
    {!zen && <Sidebar open={mobileSidebar} onClose={() => setMobileSidebar(false)} conversations={conversations} activeId={activeId} onSelect={setActiveId} onNew={() => void newChat()} onDelete={(id) => void remove(id)} />}
    <main className="flex min-w-0 flex-1 flex-col">
      {!zen && <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/85 px-3 backdrop-blur sm:px-4">
        <div className="flex min-w-0 items-center gap-2"><button className="rounded-xl p-2 hover:bg-muted lg:hidden" onClick={() => setMobileSidebar(true)}><Sparkles size={18} /></button><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary text-lg">🐱</div><span className="truncate font-bold">AI Meow</span></div>
        <div className="hidden min-w-0 items-center gap-2 md:flex"><select value={settings.model.name} onChange={(event) => void update({ model: { ...settings.model, name: event.target.value } })} className="max-w-64 rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none"><option value="openai/gpt-4o-mini">openai/gpt-4o-mini</option><option value="deepseek/deepseek-r1">deepseek/deepseek-r1</option><option value="google/gemini-2.5-flash">google/gemini-2.5-flash</option></select></div>
        <div className="flex items-center gap-1"><button title="Web Search" className={`rounded-xl p-2 ${webSearch ? "bg-secondary text-primary" : "hover:bg-muted"}`} onClick={() => setWebSearch((v) => !v)}><Search size={18} /></button><button title="TTS" className={`rounded-xl p-2 ${settings.tts.enabled ? "bg-secondary text-primary" : "hover:bg-muted"}`} onClick={() => void update({ tts: { ...settings.tts, enabled: !settings.tts.enabled } })}><Volume2 size={18} /></button><button title={zen ? "Thoát Zen" : "Zen mode"} className="rounded-xl p-2 hover:bg-muted" onClick={() => setZen((v) => !v)}><Sparkles size={18} /></button><button title="Theme" className="rounded-xl p-2 hover:bg-muted" onClick={toggleTheme}>{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</button><Link title="Settings" href="/settings" className="rounded-xl p-2 hover:bg-muted"><Settings2 size={18} /></Link></div>
      </header>}

      <div className="min-h-0 flex-1 overflow-y-auto meow-scrollbar">
        {messages.length === 0 ? <div className="mx-auto flex min-h-full max-w-2xl flex-col justify-center px-4 py-12 text-center sm:px-8"><div className="mx-auto mb-5 grid h-28 w-28 animate-meow place-items-center rounded-[32px] border border-border bg-card text-7xl shadow-md">🐱</div><h1 className="text-3xl font-bold tracking-tight">Meow~ Chào bạn! 🐱</h1><p className="mx-auto mt-2 max-w-xl text-muted-fg">Một trợ lý AI local-first: hội thoại, web search, file và cài đặt đều nằm trong máy của bạn.</p><div className="mt-8 grid gap-3 sm:grid-cols-2">{suggestions.map((item) => <button key={item} className="rounded-2xl border border-border bg-card p-4 text-left text-sm shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md" onClick={() => void sendMessage(item.slice(2).trim(), [])}>{item}</button>)}</div></div> : <MessageList messages={messages} onBranch={(message) => void branch(message)} />}
      </div>
      <div className="safe-bottom border-t border-border bg-background/80 py-3 backdrop-blur"><ChatInput onSend={sendMessage} onStop={stop} streaming={streaming} zenMode={zen} onZen={() => setZen((v) => !v)} /></div>
    </main>
    <CommandPalette open={palette} onClose={() => setPalette(false)} onNew={() => void newChat()} onSearch={() => { setMobileSidebar(true); }} onTheme={toggleTheme} onSettings={() => { window.location.href = "/settings"; }} />
  </div>;
}
