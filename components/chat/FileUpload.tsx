"use client";

import { Paperclip, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export interface PreparedAttachment { name: string; type: string; text: string; base64?: string; blob: Blob; }

export function FileUpload({ attachments, onChange }: { attachments: PreparedAttachment[]; onChange: (items: PreparedAttachment[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const pick = async (files: FileList | null) => {
    if (!files?.length) return;
    const next = Array.from(files).slice(0, 5 - attachments.length);
    if (!next.length) return;
    setLoading(true);
    try {
      const form = new FormData();
      next.forEach((file) => form.append("files", file));
      const response = await fetch("/api/upload", { method: "POST", body: form });
      const data: unknown = await response.json();
      if (!response.ok) throw new Error((data as { error?: string }).error ?? "Upload lỗi.");
      const items = "files" in (data as object) ? (data as { files: Array<{ filename: string; type: string; text: string; base64?: string }> }).files : [data as { filename: string; type: string; text: string; base64?: string }];
      onChange([...attachments, ...items.map((item, index) => ({ name: item.filename, type: item.type, text: item.text, base64: item.base64, blob: next[index] ?? new Blob([item.text], { type: item.type || "text/plain" }) }))]);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Upload lỗi."); }
    finally { setLoading(false); }
  };
  return <>
    <input ref={inputRef} type="file" multiple hidden onChange={(event) => void pick(event.target.files)} accept=".png,.jpg,.jpeg,.webp,.gif,.pdf,.txt,.md,.docx,.xlsx,.csv,.json,.py,.js,.ts" />
    <button type="button" title={loading ? "Đang đọc file..." : "Đính kèm file"} disabled={loading || attachments.length >= 5} className="rounded-xl p-2 hover:bg-muted disabled:opacity-50" onClick={() => inputRef.current?.click()}><Paperclip size={19} /></button>
  </>;
}

export function AttachmentChips({ attachments, onChange }: { attachments: PreparedAttachment[]; onChange: (items: PreparedAttachment[]) => void }) {
  return attachments.length ? <div className="flex flex-wrap gap-2 pb-2">{attachments.map((item) => <div key={`${item.name}-${item.type}`} className="inline-flex items-center gap-2 rounded-lg bg-muted px-2.5 py-1.5 text-xs"><span className="max-w-48 truncate">📄 {item.name}</span><button title="Xóa" onClick={() => onChange(attachments.filter((current) => current !== item))}><X size={14} /></button></div>)}</div> : null;
}
