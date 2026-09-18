"use client";

import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("w-full rounded-xl border border-border bg-card px-3 py-2.5 outline-none transition focus:border-primary focus:shadow-glow", className)} {...props} />;
}
