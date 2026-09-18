"use client";

import { Check, Clock3, LoaderCircle, X } from "lucide-react";
import type { ToolCallRecord } from "@/lib/db";

export function ToolCallBadge({ call }: { call: ToolCallRecord }) {
  const icon = call.state === "pending" ? <Clock3 size={14} /> : call.state === "running" ? <LoaderCircle className="animate-spin" size={14} /> : call.state === "done" ? <Check size={14} /> : <X size={14} />;
  return <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-fg">{icon}{call.state === "done" ? "Đã xong" : call.state === "running" ? "Đang chạy..." : call.name}</div>;
}
