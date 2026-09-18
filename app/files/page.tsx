"use client";

import Link from "next/link";
import { FileCode2, FileJson2, FileText, Trash2, Upload, Eye, ArrowLeft, Download } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useFiles } from "@/hooks/useFiles";
import { db } from "@/lib/db";
import { formatBytes, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { toast } from "sonner";

function iconFor(type: string, name: string) {
  if (type.includes("json") || name.endsWith(".json")) return <FileJson2 size={22} />;
  if (name.endsWith(".py") || name.endsWith(".js") || name.endsWith(".ts")) return <FileCode2 size={22} />;
  return <FileText size={22} />;
}

export default function FilesPage() {
  const { files, remove } = useFiles();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const previewRef = useRef<HTMLDialogElement>(null);
  const [preview, setPreview] = useState("");
  const filtered = useMemo(() => files.filter((file) => file.name.toLowerCase().includes(search.toLowerCase()) && (filter === "all" || file.type.includes(filter))), [files, filter, search]);

  const openPreview = (content: string) => { setPreview(content); previewRef.current?.showModal(); };
  const download = (file: typeof files[number]) => { if (!file.content) return; const url = URL.createObjectURL(new Blob([file.content], { type: file.type })); const a = document.createElement("a"); a.href = url; a.download = file.name; a.click(); URL.revokeObjectURL(url); };
  const importFile = async (file: File | undefined) => { if (!file) return; const content = await file.text(); await db.files.add({ name: file.name, type: file.type || "text/plain", size: file.size, content, blob: file, createdAt: Date.now(), tags: [] }); toast.success("Đã thêm file."); };

  return <main className="min-h-screen bg-background"><header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur"><Link href="/" className="rounded-xl p-2 hover:bg-muted"><ArrowLeft size={18} /></Link><h1 className="font-bold">📄 File đã tạo</h1><div className="ml-auto flex items-center gap-2"><label className="cursor-pointer"><Button variant="outline"><Upload size={16} /> Import<input type="file" hidden onChange={(event) => void importFile(event.target.files?.[0])} /></Button></label></div></header><div className="mx-auto max-w-6xl px-4 py-5"><div className="mb-4 grid gap-2 sm:grid-cols-[1fr_180px]"><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm file..." /><select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-xl border border-border bg-card px-3"><option value="all">Tất cả</option><option value="text">Text</option><option value="json">JSON</option><option value="csv">CSV</option></select></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((file) => <Card key={file.id} className="flex min-h-52 flex-col p-4"><div className="flex items-start gap-3"><div className="rounded-xl bg-secondary p-2">{iconFor(file.type, file.name)}</div><div className="min-w-0 flex-1"><div className="truncate font-semibold">{file.name}</div><div className="text-xs text-muted-fg">{formatBytes(file.size)} · {formatDate(file.createdAt)}</div></div></div><pre className="meow-scrollbar mt-3 min-h-20 flex-1 overflow-auto rounded-xl bg-muted p-3 text-xs text-muted-fg">{(file.content ?? "Không có preview").slice(0, 500)}</pre><div className="mt-3 flex flex-wrap gap-1"><Button size="sm" variant="outline" onClick={() => openPreview(file.content ?? "")}><Eye size={14} /> Xem</Button><Button size="sm" variant="outline" onClick={() => download(file)}><Download size={14} /> Tải</Button><Link href={`/canvas?file=${file.id}`} className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm hover:border-primary">Canvas</Link><Button size="sm" variant="danger" onClick={() => file.id && void remove(file.id)}><Trash2 size={14} /></Button></div></Card>)}{filtered.length === 0 && <div className="col-span-full rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-fg">Chưa có file nào.</div>}</div></div><dialog ref={previewRef} className="m-auto max-h-[80vh] w-[min(900px,calc(100vw-2rem))] rounded-2xl border border-border bg-card p-0 shadow-lg"><div className="flex items-center justify-between border-b border-border px-4 py-3"><b>Preview</b><button className="rounded-lg p-2 hover:bg-muted" onClick={() => previewRef.current?.close()}>Đóng</button></div><pre className="meow-scrollbar max-h-[70vh] overflow-auto p-4 text-sm">{preview}</pre></dialog></main>;
}
