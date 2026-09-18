"use client";

import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({ className, children, variant = "ghost", size = "md", ...props }: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "border-primary bg-primary px-4 text-white shadow-sm hover:bg-primary-hover hover:shadow-md",
        variant === "outline" && "border-border bg-card px-4 hover:border-primary hover:shadow-sm",
        variant === "danger" && "border-destructive bg-destructive px-4 text-white",
        variant === "ghost" && "border-transparent hover:bg-muted",
        size === "sm" && "min-h-9 px-3 text-sm",
        size === "md" && "min-h-10 px-4 text-sm",
        size === "lg" && "min-h-11 px-5",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
