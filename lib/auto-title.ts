export function fallbackTitle(content: string): string {
  const cleaned = content.trim().replace(/\s+/g, " ");
  if (!cleaned) return "Cuộc trò chuyện mới";
  return cleaned.length > 30 ? `${cleaned.slice(0, 30).trim()}…` : cleaned;
}

export async function createAutoTitleViaApi(content: string, provider: string, model: string, apiKey?: string, baseUrl?: string): Promise<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-AI-Meow-Task": "title" },
    body: JSON.stringify({ messages: [{ role: "user", content: `Đặt tiêu đề 3-5 từ cho: ${content}` }], provider, model, apiKey, baseUrl, toolsEnabled: false, reasoning: false, temperature: 0.2, maxTokens: 48 })
  });
  if (!response.ok) return fallbackTitle(content);
  const text = await response.text();
  return text.trim().replace(/^['"`]+|['"`]+$/g, "").slice(0, 80) || fallbackTitle(content);
}
