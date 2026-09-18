"use client";

import { Eye, EyeOff, KeyRound, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { encryptSecret, hashPassphrase } from "@/lib/crypto";
import { settingSet } from "@/lib/db";
import type { AppSettings } from "@/hooks/useSettings";

const providers = [
  ["xkiro", "Xkiro", "Đa mô hình"],
  ["openrouter", "OpenRouter", "Đa mô hình"],
  ["kiraai", "KiraAI", "Tiếng Việt"],
  ["openai", "OpenAI", "Chính thức"],
  ["custom", "Custom", "Self-host"]
] as const;

export function ProviderSelector({ settings, update }: { settings: AppSettings; update: (patch: Partial<AppSettings>) => Promise<void> }) {
  const [key, setKey] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [show, setShow] = useState(false);
  const [baseUrl, setBaseUrl] = useState(settings.provider.keys[settings.provider.active]?.baseUrl ?? "");
  const [testing, setTesting] = useState(false);

  const active = settings.provider.active;
  const save = async () => {
    try {
      if (key && !passphrase) throw new Error("Nhập passphrase để mã hóa API key.");
      const encrypted = key ? await encryptSecret(key, passphrase) : settings.provider.keys[active]?.apiKeyEnc;
      if (passphrase) {
        sessionStorage.setItem("ai-meow-passphrase", passphrase);
        await settingSet("ai-meow-passphrase-hash", await hashPassphrase(passphrase));
      }
      const nextKeys = { ...settings.provider.keys, [active]: { apiKeyEnc: encrypted, baseUrl } };
      await update({ provider: { ...settings.provider, keys: nextKeys } });
      setKey("");
      toast.success("Đã lưu provider. API key chỉ lưu dưới dạng AES-256-GCM.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Không thể lưu provider."); }
  };

  const test = async () => {
    setTesting(true);
    try {
      if (!key && !settings.provider.keys[active]?.apiKeyEnc) throw new Error("Cần API key để test.");
      toast.success("Cấu hình đã sẵn sàng. Test models sẽ chạy qua proxy khi dùng Chat.");
    } finally { setTesting(false); }
  };

  return <div className="space-y-4">{providers.map(([id, label, badge]) => <Card key={id} className={`p-4 transition ${active === id ? "border-primary shadow-glow" : ""}`}>
    <button className="flex w-full items-start gap-3 text-left" onClick={() => { void update({ provider: { ...settings.provider, active: id } }); setBaseUrl(settings.provider.keys[id]?.baseUrl ?? ""); }}>
      <span className={`mt-1 h-4 w-4 rounded-full border-4 ${active === id ? "border-primary" : "border-border"}`} />
      <span className="min-w-0 flex-1"><span className="font-semibold">{label}</span><span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[11px]">{badge}</span><span className="mt-1 block text-xs text-muted-fg">{id === "custom" ? "OpenAI-compatible endpoint" : "Key của bạn có thể nằm local và chỉ gửi qua /api/chat."}</span></span>
    </button>
    {active === id && <div className="mt-4 grid gap-3 md:grid-cols-2">
      <div className="md:col-span-2"><label className="mb-1 block text-xs font-medium">API Key</label><div className="relative"><Input type={show ? "text" : "password"} value={key} placeholder="••••••••••••" onChange={(event) => setKey(event.target.value)} className="pr-20" /><button title={show ? "Ẩn" : "Hiện"} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted-fg" onClick={() => setShow((v) => !v)}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
      <div><label className="mb-1 block text-xs font-medium">Base URL</label><Input value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} placeholder="https://.../v1" /></div>
      <div><label className="mb-1 block text-xs font-medium">Passphrase mã hóa</label><Input type="password" value={passphrase} onChange={(event) => setPassphrase(event.target.value)} placeholder="Chỉ nhớ trong session" /></div>
      <div className="flex flex-wrap items-center gap-2 md:col-span-2"><Button variant="outline" onClick={() => void test()} disabled={testing}><RefreshCw size={15} /> {testing ? "Đang test" : "Kiểm tra kết nối"}</Button><Button variant="primary" onClick={() => void save()}><KeyRound size={15} /> Lưu</Button></div>
    </div>}
  </Card>)}</div>;
}
