import { createOpenAI } from "@ai-sdk/openai";

export type ProviderId = "xkiro" | "openrouter" | "kiraai" | "openai" | "custom";

export interface ProviderConfig {
  id: ProviderId;
  label: string;
  baseUrl: string;
  envKey: string;
  badge: string;
}

export const PROVIDERS: Record<ProviderId, ProviderConfig> = {
  xkiro: { id: "xkiro", label: "Xkiro", baseUrl: process.env.XKIRO_BASE_URL ?? "", envKey: "XKIRO_API_KEY", badge: "Đa mô hình" },
  openrouter: { id: "openrouter", label: "OpenRouter", baseUrl: process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1", envKey: "OPENROUTER_API_KEY", badge: "Đa mô hình" },
  kiraai: { id: "kiraai", label: "KiraAI", baseUrl: process.env.KIRA_BASE_URL ?? "", envKey: "KIRA_API_KEY", badge: "Tiếng Việt" },
  openai: { id: "openai", label: "OpenAI", baseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1", envKey: "OPENAI_API_KEY", badge: "Chính thức" },
  custom: { id: "custom", label: "Custom", baseUrl: "", envKey: "", badge: "Self-host" }
};

export function normalizeBaseUrl(value: string): string {
  return value.replace(/\/$/, "");
}

export function resolveProviderBaseUrl(provider: ProviderId, suppliedBaseUrl?: string): string {
  if (provider === "custom" && suppliedBaseUrl) return normalizeBaseUrl(suppliedBaseUrl);
  if (suppliedBaseUrl) return normalizeBaseUrl(suppliedBaseUrl);
  return normalizeBaseUrl(PROVIDERS[provider].baseUrl);
}

export function resolveEnvKey(provider: ProviderId): string | undefined {
  const envName = PROVIDERS[provider].envKey;
  if (!envName) return undefined;
  return process.env[envName];
}

export function makeOpenAICompatibleProvider(args: {
  provider: ProviderId;
  apiKey: string;
  baseUrl: string;
}) {
  const headers: Record<string, string> = {
    "X-AI-Meow": "1"
  };
  if (args.provider === "openrouter") {
    headers["HTTP-Referer"] = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    headers["X-Title"] = process.env.NEXT_PUBLIC_APP_NAME ?? "AI Meow";
  }
  return createOpenAI({ apiKey: args.apiKey, baseURL: args.baseUrl, headers });
}

export async function fetchModels(provider: ProviderId, apiKey: string, baseUrl: string): Promise<Array<{ id: string; object?: string }>> {
  const response = await fetch(`${normalizeBaseUrl(baseUrl)}/models`, {
    headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`Model endpoint trả về ${response.status}.`);
  const json: unknown = await response.json();
  if (typeof json !== "object" || json === null || !Array.isArray((json as { data?: unknown }).data)) return [];
  return ((json as { data: unknown[] }).data).filter((item): item is { id: string; object?: string } => typeof item === "object" && item !== null && typeof (item as { id?: unknown }).id === "string").slice(0, 200);
}
