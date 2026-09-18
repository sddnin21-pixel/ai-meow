"use client";

import { Files, Search, Settings2, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { NewChatButton } from "./NewChatButton";
import { ConversationList } from "./ConversationList";
import type { Conversation } from "@/lib/db";

export function Sidebar({ open, onClose, conversations, activeId, onSelect, onNew, onDelete }: { open: boolean; onClose: () => void; conversations: Conversation[]; activeId?: number; onSelect: (id: number) => void; onNew: () => void; onDelete: (id: number) => void }) {
  const [search, setSearch] = useState("");
  return (
    <>
      {open && <button aria-label="Đóng menu" className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-40 w-[280px] border-r border-border bg-muted/90 backdrop-blur transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-full flex-col p-3">
          <div className="flex items-center justify-between pb-3 lg:hidden"><span className="font-bold">AI Meow</span><button onClick={onClose}><X /></button></div>
          <NewChatButton onClick={() => { onNew(); onClose(); }} />
          <div className="relative my-3"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-fg" size={16} /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm cuộc trò chuyện" className="pl-9" /></div>
          <div className="meow-scrollbar flex-1 overflow-y-auto"><ConversationList conversations={conversations} activeId={activeId} onSelect={(id) => { onSelect(id); onClose(); }} onDelete={onDelete} search={search} /></div>
          <div className="space-y-1 border-t border-border pt-3">
            <Link href="/files" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-card"><Files size={17} /> Files đã tạo</Link>
            <Link href="/settings" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-card"><Settings2 size={17} /> Cài đặt</Link>
            <div className="px-3 pt-1 text-[11px] text-muted-fg">AI Meow v1.0.0 · local-first</div>
          </div>
        </div>
      </aside>
    </>
  );
}
