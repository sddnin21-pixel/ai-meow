import { db } from "./db";

export async function checkRateLimit(limitPerMinute: number): Promise<{ allowed: boolean; remaining: number }> {
  const key = "local-rate-limit";
  const now = Date.now();
  const windowMs = 60_000;
  const row = await db.settings.get(key);
  const state = row?.value as { startedAt: number; count: number } | undefined;
  if (!state || now - state.startedAt >= windowMs) {
    await db.settings.put({ key, value: { startedAt: now, count: 1 } });
    return { allowed: true, remaining: Math.max(0, limitPerMinute - 1) };
  }
  const count = state.count + 1;
  await db.settings.put({ key, value: { ...state, count } });
  return { allowed: count <= limitPerMinute, remaining: Math.max(0, limitPerMinute - count) };
}
