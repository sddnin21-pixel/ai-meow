"use client";

import { useCallback, useEffect, useState } from "react";
import { db, settingGet, settingSet } from "@/lib/db";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/system-prompt";

export interface AppSettings {
  provider: { active: "xkiro" | "openrouter" | "kiraai" | "openai" | "custom"; keys: Record<string, { apiKeyEnc?: unknown; baseUrl?: string }> };
  model: { name: string; temperature: number; maxTokens: number; topP: number };
  theme: "light" | "dark" | "system";
  language: "vi" | "en";
  tools: { webSearch: boolean; fileWriter: boolean; fileReader: boolean; guardrails: boolean; rateLimit: number; engine: "duckduckgo" | "brave" | "tavily" | "searxng" };
  tts: { enabled: boolean; voice: string; rate: number };
  persona: { systemPrompt: string; voicePersona: string; alwaysMeow: boolean; emoji: boolean };
  reasoning: boolean;
  costTracking: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  provider: { active: "openrouter", keys: {} },
  model: { name: "openai/gpt-4o-mini", temperature: 0.7, maxTokens: 4096, topP: 1 },
  theme: "system",
  language: "vi",
  tools: { webSearch: true, fileWriter: true, fileReader: true, guardrails: true, rateLimit: 20, engine: "duckduckgo" },
  tts: { enabled: false, voice: "", rate: 1 },
  persona: { systemPrompt: DEFAULT_SYSTEM_PROMPT, voicePersona: "Dễ thương", alwaysMeow: true, emoji: true },
  reasoning: false,
  costTracking: true
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stored = await settingGet("app-settings", DEFAULT_SETTINGS);
      if (!cancelled) {
        setSettings({ ...DEFAULT_SETTINGS, ...stored, provider: { ...DEFAULT_SETTINGS.provider, ...stored.provider }, model: { ...DEFAULT_SETTINGS.model, ...stored.model }, tools: { ...DEFAULT_SETTINGS.tools, ...stored.tools }, tts: { ...DEFAULT_SETTINGS.tts, ...stored.tts }, persona: { ...DEFAULT_SETTINGS.persona, ...stored.persona } });
        setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const update = useCallback(async (patch: Partial<AppSettings>) => {
    setSettings((previous) => {
      const next = { ...previous, ...patch };
      void settingSet("app-settings", next);
      return next;
    });
  }, []);

  const reset = useCallback(async () => {
    setSettings(DEFAULT_SETTINGS);
    await settingSet("app-settings", DEFAULT_SETTINGS);
  }, []);

  return { settings, loaded, update, reset };
}

export async function estimateStorage(): Promise<number> {
  if (typeof navigator !== "undefined" && navigator.storage?.estimate) {
    const estimate = await navigator.storage.estimate();
    return estimate.usage ?? 0;
  }
  return 0;
}

export async function getCounts(): Promise<{ conversations: number; messages: number; files: number }> {
  const [conversations, messages, files] = await Promise.all([db.conversations.count(), db.messages.count(), db.files.count()]);
  return { conversations, messages, files };
}
