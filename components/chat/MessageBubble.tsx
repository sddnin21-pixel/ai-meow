"use client";

import { Copy, GitBranch, ThumbsDown, ThumbsUp, Volume2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage } from "@/lib/db";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ReasoningPanel } from "./ReasoningPanel";
import { SourceCitation } from "./SourceCitation";
import { ToolCallBadge } from "./ToolCallBadge";
import { speakText } from "@/lib/tts";
import { toast } from "sonner";

export function MessageBubble({ message, onBranch }: { message: ChatMessage; onBranch: (message: ChatMessage) => void }) {
  const user = message.role === "user";
  const copy = async () => { await navigator.clipboard.writeText(message.content); toast.success("Đã copy."); };
  return <div className={cn("group flex gap-2.5 py-3", user ? "justify-end" : "justify-start")}>
    {!user && <div className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-card text-lg">🐱</div>}
    <div className={cn("max-w-[90%] sm:max-w-[80%]", user && "items-end") }>
      <div className={cn("rounded-2xl border px-4 py-3 shadow-sm", user ? "rounded-br-sm border-primary bg-primary text-white" : "rounded-bl-sm border-border bg-card")}>
        {!user && <ReasoningPanel reasoning={message.reasoning} />}
        {message.toolCalls?.length ? <div className="mb-2 flex flex-wrap gap-1.5">{message.toolCalls.map((call) => <ToolCallBadge key={call.id} call={call} />)}</div> : null}
        <div className="markdown text-[15px] leading-7">{message.content ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown> : <span className="inline-flex"><span className="animate-blink">▋</span></span>}</div>
        <SourceCitation sources={message.sources} />
      </div>
      <div className={cn("mt-1 flex gap-1 opacity-0 transition group-hover:opacity-100", user ? "justify-end" : "justify-start")}>
        {!user && <><Button size="sm" variant="ghost" onClick={copy} title="Copy"><Copy size={15} /></Button><Button size="sm" variant="ghost" onClick={() => speakText(message.content)} title="Đọc"><Volume2 size={15} /></Button><Button size="sm" variant="ghost" onClick={() => toast.info("Regenerate sẽ dùng lại context hiện tại.")} title="Regenerate"><GitBranch size={15} /></Button><Button size="sm" variant="ghost" title="Like"><ThumbsUp size={15} /></Button><Button size="sm" variant="ghost" title="Dislike"><ThumbsDown size={15} /></Button></>}
        <Button size="sm" variant="ghost" onClick={() => onBranch(message)} title="Branch"><GitBranch size={15} /></Button>
      </div>
    </div>
    {user && <div className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold">Bạn</div>}
  </div>;
}
