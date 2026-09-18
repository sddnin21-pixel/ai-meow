"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

export function ReasoningPanel({ reasoning }: { reasoning?: string }) {
  const [open, setOpen] = useState(false);
  if (!reasoning) return null;
  return <div className="mb-2 rounded-xl border border-border bg-muted/50">
    <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-muted-fg" onClick={() => setOpen((value) => !value)}>{open ? <ChevronDown size={15} /> : <ChevronRight size={15} />} 💭 Đang suy nghĩ...</button>
    {open && <div className="border-t border-border px-3 py-2 text-sm italic text-muted-fg">{reasoning}</div>}
  </div>;
}
