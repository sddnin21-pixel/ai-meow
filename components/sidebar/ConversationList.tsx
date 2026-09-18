"use client";

import { MoreHorizontal, Pin } from "lucide-react";
import type { Conversation } from "@/lib/db";
import { cn } from "@/lib/utils";

export function ConversationList({ conversations, activeId, onSelect, onDelete, search }: { conversations: Conversation[]; activeId?: number; onSelect: (id: number) => void; onDelete: (id: number) => void; search: string }) {
  const filtered = conversations.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));
  const pinned = filtered.filter((item) => item.pinned);
  const normal = filtered.filter((item) => !item.pinned);
  const rows = [...pinned, ...normal];
  return (
    <div className="space-y-1">
      {rows.map((item) => (
        <div key={item.id} className={cn("group flex items-center gap-2 rounded-xl border-l-[3px] p-2.5", activeId === item.id ? "border-primary bg-accent" : "border-transparent hover:bg-muted")}>
          <button className="min-w-0 flex-1 text-left" onClick={() => item.id && onSelect(item.id)}>
            <div className="flex items-center gap-1 truncate text-sm font-semibold">{item.pinned && <Pin size={13} />}{item.title}</div>
            <div className="truncate text-xs text-muted-fg">{new Date(item.updatedAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}</div>
          </button>
          <button aria-label="Xóa" title="Xóa" className="rounded-lg p-1.5 opacity-0 transition group-hover:opacity-100 hover:bg-card" onClick={() => item.id && onDelete(item.id)}><MoreHorizontal size={17} /></button>
        </div>
      ))}
      {rows.length === 0 && <p className="px-2 py-4 text-center text-xs text-muted-fg">Không tìm thấy hội thoại.</p>}
    </div>
  );
}
