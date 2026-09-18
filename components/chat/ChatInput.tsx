"use client";

import { Maximize, Mic, Send, Square } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FileUpload, AttachmentChips, type PreparedAttachment } from "./FileUpload";

export function ChatInput({ onSend, onStop, streaming, placeholder = "Hỏi Meow bất cứ điều gì...", zenMode, onZen }: { onSend: (text: string, attachments: PreparedAttachment[]) => Promise<void>; onStop: () => void; streaming: boolean; placeholder?: string; zenMode: boolean; onZen: () => void }) {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<PreparedAttachment[]>([]);
  const submit = async () => { if (!value.trim() && attachments.length === 0) return; const text = value; const files = attachments; setValue(""); setAttachments([]); await onSend(text, files); };
  useEffect(() => { const handler = (event: KeyboardEvent) => { if (event.key === "Enter" && !event.shiftKey && document.activeElement?.tagName === "TEXTAREA") { event.preventDefault(); void submit(); } }; window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler); });
  return <div className="mx-auto w-full max-w-3xl px-3 sm:px-5">
    <div className="rounded-2xl border border-border bg-card p-2.5 shadow-lg">
      <AttachmentChips attachments={attachments} onChange={setAttachments} />
      <div className="flex items-end gap-1">
        <FileUpload attachments={attachments} onChange={setAttachments} />
        <TextareaAutosize minRows={1} maxRows={8} value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} className="max-h-52 min-h-10 flex-1 resize-none bg-transparent px-2.5 py-2.5 text-[15px] outline-none" />
        <button type="button" title="Mic" className="rounded-xl p-2 hover:bg-muted"><Mic size={19} /></button>
        <button type="button" title={zenMode ? "Thoát Zen" : "Zen mode"} onClick={onZen} className="rounded-xl p-2 hover:bg-muted"><Maximize size={18} /></button>
        {streaming ? <Button size="sm" variant="outline" onClick={onStop}><Square size={16} /> Stop</Button> : <Button size="sm" variant="primary" onClick={() => void submit()}><Send size={16} /> Gửi</Button>}
      </div>
      <div className="px-1.5 pt-1 text-[11px] text-muted-fg">AI Meow có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.</div>
    </div>
  </div>;
}
