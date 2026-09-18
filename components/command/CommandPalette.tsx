"use client";

import { Command, Moon, Plus, Search, Settings2, Sun } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";

interface CommandItem { label: string; icon: React.ReactNode; action: () => void; }

export function CommandPalette({ open, onClose, onNew, onSearch, onTheme, onSettings }: { open: boolean; onClose: () => void; onNew: () => void; onSearch: () => void; onTheme: () => void; onSettings: () => void }) {
  const [query, setQuery] = useState("");
  const commands = useMemo<CommandItem[]>(() => [
    { label: "Cuộc trò chuyện mới", icon: <Plus size={17} />, action: onNew },
    { label: "Tìm hội thoại", icon: <Search size={17} />, action: onSearch },
    { label: "Đổi theme", icon: <Moon size={17} />, action: onTheme },
    { label: "Mở cài đặt", icon: <Settings2 size={17} />, action: onSettings }
  ], [onNew, onSearch, onTheme, onSettings]);
  const filtered = commands.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));
  useEffect(() => { if (!open) setQuery(""); }, [open]);
  useEffect(() => { if (!open) return; const handler = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); if (event.key === "Enter" && filtered[0]) { filtered[0].action(); onClose(); } }; window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler); }, [filtered, onClose, open]);
  if (!open) return null;
  return <div className="fixed inset-0 z-[60] grid place-items-center bg-black/25 p-4 backdrop-blur-sm" onMouseDown={onClose}>
    <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-lg" onMouseDown={(event) => event.stopPropagation()}>
      <div className="flex items-center gap-2 border-b border-border p-3"><Command size={18} /><Input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm lệnh..." /></div>
      <div className="max-h-80 overflow-y-auto p-2">{filtered.map((item) => <button key={item.label} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-muted" onClick={() => { item.action(); onClose(); }}>{item.icon}{item.label}</button>)}</div>
      <div className="border-t border-border px-3 py-2 text-[11px] text-muted-fg">Enter chọn · Esc đóng · Ctrl/Cmd+K mở</div>
    </div>
  </div>;
}
