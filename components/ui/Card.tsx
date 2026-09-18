import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn("rounded-2xl border border-border bg-card shadow-sm", className)}>{children}</div>;
}
