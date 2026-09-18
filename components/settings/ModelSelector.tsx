"use client";

import type { AppSettings } from "@/hooks/useSettings";

export function ModelSelector({ settings, update }: { settings: AppSettings; update: (patch: Partial<AppSettings>) => Promise<void> }) {
  return <div className="grid gap-4 md:grid-cols-2">
    <label className="rounded-2xl border border-border bg-card p-4"><span className="mb-2 block text-sm font-semibold">Model</span><select value={settings.model.name} onChange={(event) => void update({ model: { ...settings.model, name: event.target.value } })} className="w-full rounded-xl border border-border bg-card px-3 py-2.5"><option>openai/gpt-4o-mini</option><option>deepseek/deepseek-r1</option><option>google/gemini-2.5-flash</option><option>anthropic/claude-3.7-sonnet</option></select></label>
    <label className="rounded-2xl border border-border bg-card p-4"><span className="mb-2 block text-sm font-semibold">Temperature · {settings.model.temperature.toFixed(2)}</span><input type="range" min="0" max="2" step="0.05" value={settings.model.temperature} onChange={(event) => void update({ model: { ...settings.model, temperature: Number(event.target.value) } })} className="w-full" /></label>
    <label className="rounded-2xl border border-border bg-card p-4"><span className="mb-2 block text-sm font-semibold">Max tokens · {settings.model.maxTokens}</span><input type="range" min="256" max="32000" step="256" value={settings.model.maxTokens} onChange={(event) => void update({ model: { ...settings.model, maxTokens: Number(event.target.value) } })} className="w-full" /></label>
    <label className="rounded-2xl border border-border bg-card p-4"><span className="mb-2 block text-sm font-semibold">Top P · {settings.model.topP.toFixed(2)}</span><input type="range" min="0" max="1" step="0.05" value={settings.model.topP} onChange={(event) => void update({ model: { ...settings.model, topP: Number(event.target.value) } })} className="w-full" /></label>
  </div>;
}
