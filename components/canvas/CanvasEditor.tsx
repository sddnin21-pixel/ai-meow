"use client";

import { Check, Code2, Copy, Download, Eye, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { db } from "@/lib/db";
import { downloadText } from "@/lib/export";
import { toast } from "sonner";

export function CanvasEditor({ fileId }: { fileId?: number }) {
  const [filename, setFilename] = useState("untitled.md");
  const [content, setContent] = useState("# AI Meow Canvas\n\nViết nội dung ở đây...");
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState(true);

  useEffect(() => { if (!fileId) return; void db.files.get(fileId).then((file) => { if (file) { setFilename(file.name); setContent(file.content ?? ""); } }); }, [fileId]);
  useEffect(() => { const timer = window.setTimeout(() => { if (!saved) { void db.files.put({ id: fileId, name: filename, type: "text/markdown", size: new Blob([content]).size, content, createdAt: Date.now(), tags: [] }).then(() => setSaved(true)); } }, 2000); return () => window.clearTimeout(timer); }, [content, filename, fileId, saved]);

  const save = async () => { const now = Date.now(); if (fileId) await db.files.update(fileId, { name: filename, content, size: new Blob([content]).size }); else await db.files.add({ name: filename, type: "text/markdown", size: new Blob([content]).size, content, createdAt: now, tags: [] }); setSaved(true); toast.success("Đã lưu Canvas."); };
  const copy = async () => { await navigator.clipboard.writeText(content); toast.success("Đã copy."); };

  return <div className="flex min-h-[calc(100dvh-56px)] flex-col"><div className="flex flex-wrap items-center gap-2 border-b border-border bg-card p-2"><input value={filename} onChange={(event) => { setFilename(event.target.value); setSaved(false); }} className="min-w-40 flex-1 rounded-xl border border-border bg-muted px-3 py-2 text-sm" /><Button size="sm" variant={saved ? "outline" : "primary"} onClick={() => void save()}>{saved ? <Check size={15} /> : <Save size={15} />} {saved ? "Saved" : "Save"}</Button><Button size="sm" variant="outline" onClick={() => void copy()}><Copy size={15} /> Copy</Button><Button size="sm" variant="outline" onClick={() => downloadText(filename, content)}><Download size={15} /> Download</Button><Button size="sm" variant={preview ? "primary" : "outline"} onClick={() => setPreview((value) => !value)}>{preview ? <Code2 size={15} /> : <Eye size={15} />} {preview ? "Code" : "Preview"}</Button></div>{preview ? <article className="markdown min-h-0 flex-1 overflow-auto p-5" dangerouslySetInnerHTML={{ __html: content.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replace(/^# (.+)$/gm, "<h1>$1</h1>").replace(/^## (.+)$/gm, "<h2>$1</h2>").replace(/\n\n/g, "<p></p>") }} /> : <textarea spellCheck={false} value={content} onChange={(event) => { setContent(event.target.value); setSaved(false); }} className="meow-scrollbar min-h-0 flex-1 resize-none bg-background p-5 font-mono text-sm leading-6 outline-none" />}</div>;
}
