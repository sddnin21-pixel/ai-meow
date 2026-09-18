"use client";

import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("w-full resize-y rounded-xl border border-border bg-card px-3 py-2.5 outline-none transition focus:border-primary focus:shadow-glow", className)} {...props} />;
}
