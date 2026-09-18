import { z } from "zod";

export const createFileInput = z.object({
  name: z.string().min(1).max(180),
  type: z.string().default("text/plain"),
  content: z.string().max(500_000),
  description: z.string().max(500).optional()
});

export function makeDataUrl(type: string, content: string): string {
  return `data:${type};charset=utf-8,${encodeURIComponent(content)}`;
}
