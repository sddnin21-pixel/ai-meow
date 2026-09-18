export function TypingIndicator() {
  return <div className="flex items-center gap-1 text-muted-fg" aria-label="AI đang trả lời"><span className="h-2 w-2 animate-dot rounded-full bg-primary [animation-delay:-0.2s]" /><span className="h-2 w-2 animate-dot rounded-full bg-primary [animation-delay:0s]" /><span className="h-2 w-2 animate-dot rounded-full bg-primary [animation-delay:0.2s]" /></div>;
}
