"use client";

import type { SourceRecord } from "@/lib/db";

export function SourceCitation({ sources }: { sources?: SourceRecord[] }) {
  if (!sources?.length) return null;
  return <div className="mt-3 grid gap-2 sm:grid-cols-2">{sources.map((source, index) => <a key={`${source.url}-${index}`} href={source.url} target="_blank" rel="noreferrer" className="rounded-xl border border-border bg-muted/60 p-2.5 transition hover:border-primary hover:shadow-sm"><div className="flex items-center gap-2"><img src={source.favicon || `https://www.google.com/s2/favicons?domain=${source.domain}&sz=32`} alt="" className="h-5 w-5 rounded" /><div className="min-w-0"><div className="truncate text-xs font-semibold">[{index + 1}] {source.title}</div><div className="text-[11px] text-muted-fg">{source.domain}</div></div></div></a>)}</div>;
}
