"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Database, Download, FileInput, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ProviderSelector } from "@/components/settings/ProviderSelector";
import { ModelSelector } from "@/components/settings/ModelSelector";
import { ThemeToggle } from "@/components/settings/ThemeToggle";
import { exportDatabase, importDatabase, db, settingSet } from "@/lib/db";
import { formatBytes } from "@/lib/utils";
import { estimateStorage, getCounts, useSettings } from "@/hooks/useSettings";

const tabs = ["Provider", "Model", "Persona", "Công cụ", "Giao diện", "Dữ liệu"] as const;

type Tab = typeof tabs[number];

export default function SettingsPage() {
  const { settings, update, reset } = useSettings();
  const [tab, setTab] = useState<Tab>("Provider");
  const [stats, setStats] = useState({ conversations: 0, messages: 0, files: 0, usage: 0 });
  useEffect(() => { void Promise.all([getCounts(), estimateStorage()]).then(([counts, usage]) => setStats({ ...counts, usage })); }, []);

  const exportAll = async () => {
    const payload = await exportDatabase();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `ai-meow-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(url); toast.success("Đã export backup.");
  };
  const importAll = async (file: File | undefined) => { if (!file) return; try { const data: unknown = JSON.parse(await file.text()); if (typeof data !== "object" || data === null) throw new Error("JSON không hợp lệ."); await importDatabase(data as Record<string, unknown>); toast.success("Đã import."); } catch (error) { toast.error(error instanceof Error ? error.message : "Import lỗi."); } };
  const clearConversations = async () => { if (!window.confirm("Xóa toàn bộ hội thoại?")) return; await db.messages.clear(); await db.conversations.clear(); toast.success("Đã xóa hội thoại."); };
  const resetAll = async () => { if (!window.confirm("XÓA TOÀN BỘ DỮ LIỆU AI MEOW?")) return; indexedDB.deleteDatabase("ai-meow"); window.location.href = "/"; };

  return <main className="min-h-screen bg-background"><header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur"><Link href="/" className="rounded-xl p-2 hover:bg-muted"><ArrowLeft size={18} /></Link><div className="font-bold">⚙️ Cài đặt AI Meow</div></header><div className="mx-auto grid max-w-6xl gap-4 px-4 py-5 lg:grid-cols-[200px_1fr]">
    <aside className="h-fit rounded-2xl border border-border bg-card p-2">{tabs.map((item) => <button key={item} className={`w-full rounded-xl px-3 py-2 text-left text-sm ${tab === item ? "bg-secondary font-semibold" : "hover:bg-muted"}`} onClick={() => setTab(item)}>{item}</button>)}</aside>
    <section className="min-w-0 space-y-4">
      {tab === "Provider" && <><div><h1 className="text-2xl font-bold">Provider</h1><p className="mt-1 text-sm text-muted-fg">API key được mã hóa AES-256-GCM trong IndexedDB; không hard-code vào bundle.</p></div><ProviderSelector settings={settings} update={update} /><Card className="p-4"><div className="flex items-center justify-between"><div><div className="font-semibold">Auto fallback</div><div className="text-xs text-muted-fg">Xử lý lỗi bằng provider kế tiếp khi có ENV key trên server.</div></div><input type="checkbox" checked onChange={() => toast.info("Fallback luôn sẵn sàng khi provider kế tiếp có key.")} /></div></Card></>}
      {tab === "Model" && <><h1 className="text-2xl font-bold">Model</h1><ModelSelector settings={settings} update={update} /><Card className="p-4"><label className="flex items-center justify-between"><span><b>Hiển thị reasoning</b><span className="block text-xs text-muted-fg">Giữ panel reasoning khi provider/model trả về dữ liệu đó.</span></span><input type="checkbox" checked={settings.reasoning} onChange={(event) => void update({ reasoning: event.target.checked })} /></label></Card></>}
      {tab === "Persona" && <Card className="p-4 space-y-4"><div><h1 className="text-2xl font-bold">Persona</h1><p className="mt-1 text-sm text-muted-fg">System prompt được lưu local.</p></div><Textarea rows={14} value={settings.persona.systemPrompt} onChange={(event) => void update({ persona: { ...settings.persona, systemPrompt: event.target.value } })} /><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => void update({ persona: { ...settings.persona, systemPrompt: "Bạn là AI Meow — trợ lý AI dễ thương, thông minh và hữu ích.\nLuôn gọi user là bạn và ưu tiên trả lời rõ ràng.\nMeow~" } })}><RotateCcw size={15} /> Khôi phục mặc định</Button><select className="rounded-xl border border-border bg-card px-3" value={settings.persona.voicePersona} onChange={(event) => void update({ persona: { ...settings.persona, voicePersona: event.target.value } })}><option>Dễ thương</option><option>Chuyên nghiệp</option><option>Hài hước</option><option>Nghiêm túc</option></select></div></Card>}
      {tab === "Công cụ" && <Card className="p-4 space-y-4"><h1 className="text-2xl font-bold">Công cụ</h1><label className="flex items-center justify-between"><span>Web Search</span><input type="checkbox" checked={settings.tools.webSearch} onChange={(event) => void update({ tools: { ...settings.tools, webSearch: event.target.checked } })} /></label><label>Engine<select className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2" value={settings.tools.engine} onChange={(event) => void update({ tools: { ...settings.tools, engine: event.target.value as typeof settings.tools.engine } })}><option value="duckduckgo">DuckDuckGo</option><option value="brave">Brave</option><option value="tavily">Tavily</option><option value="searxng">SearXNG</option></select></label><label className="block">Rate limit local / phút<input type="range" min="1" max="120" value={settings.tools.rateLimit} onChange={(event) => void update({ tools: { ...settings.tools, rateLimit: Number(event.target.value) } })} className="mt-2 w-full" /><div className="text-xs text-muted-fg">{settings.tools.rateLimit} request/phút</div></label><label className="flex items-center justify-between"><span>Chống prompt injection</span><input type="checkbox" checked={settings.tools.guardrails} onChange={(event) => void update({ tools: { ...settings.tools, guardrails: event.target.checked } })} /></label></Card>}
      {tab === "Giao diện" && <><h1 className="text-2xl font-bold">Giao diện</h1><ThemeToggle settings={settings} update={update} /><Card className="p-4 space-y-4"><label className="flex items-center justify-between"><span>Tự động đọc câu trả lời</span><input type="checkbox" checked={settings.tts.enabled} onChange={(event) => void update({ tts: { ...settings.tts, enabled: event.target.checked } })} /></label><label className="block">Tốc độ TTS<input type="range" min="0.5" max="2" step="0.05" value={settings.tts.rate} onChange={(event) => void update({ tts: { ...settings.tts, rate: Number(event.target.value) } })} className="mt-2 w-full" /></label></Card></>}
      {tab === "Dữ liệu" && <><h1 className="text-2xl font-bold">Dữ liệu</h1><div className="grid gap-3 sm:grid-cols-3">{Object.entries({ Conversations: stats.conversations, Messages: stats.messages, Files: stats.files }).map(([key, value]) => <Card key={key} className="p-4"><div className="text-xs text-muted-fg">{key}</div><div className="mt-1 text-2xl font-bold">{value}</div></Card>)}</div><Card className="p-4"><div className="flex items-center gap-2"><Database size={18} /><b>IndexedDB usage</b><span className="ml-auto text-sm text-muted-fg">{formatBytes(stats.usage)}</span></div></Card><Card className="grid gap-2 p-4 sm:grid-cols-2"><Button variant="outline" onClick={() => void exportAll()}><Download size={16} /> Export tất cả</Button><label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm hover:border-primary"><FileInput size={16} /> Import<input type="file" hidden accept="application/json" onChange={(event) => void importAll(event.target.files?.[0])} /></label><Button variant="danger" onClick={() => void clearConversations()}><Trash2 size={16} /> Xóa tất cả hội thoại</Button><Button variant="danger" onClick={() => void resetAll()}><Trash2 size={16} /> Reset toàn bộ app</Button><Button variant="outline" onClick={() => void reset()} className="sm:col-span-2"><RotateCcw size={16} /> Reset cài đặt</Button></Card></>}
    </section>
  </div></main>;
}
