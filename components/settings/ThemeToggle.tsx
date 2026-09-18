"use client";

import type { AppSettings } from "@/hooks/useSettings";

export function ThemeToggle({ settings, update }: { settings: AppSettings; update: (patch: Partial<AppSettings>) => Promise<void> }) {
  return <div className="grid gap-3 sm:grid-cols-3">{(["light", "dark", "system"] as const).map((theme) => <button key={theme} className={`rounded-2xl border p-4 text-left ${settings.theme === theme ? "border-primary bg-secondary" : "border-border bg-card"}`} onClick={() => void update({ theme })}><div className="font-semibold">{theme === "light" ? "☀️ Sáng" : theme === "dark" ? "🌙 Tối" : "🖥️ Hệ thống"}</div><div className="mt-1 text-xs text-muted-fg">Chuyển giao diện app</div></button>)}</div>;
}
