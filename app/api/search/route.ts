import { z } from "zod";
import { searchBrave, searchDuckDuckGo } from "@/lib/tools/web-search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const schema = z.object({
  query: z.string().min(2).max(500),
  engine: z.enum(["duckduckgo", "brave", "tavily", "searxng"]).default("duckduckgo"),
  maxResults: z.number().int().min(3).max(10).default(5)
});

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Query không hợp lệ." }, { status: 400 });

  try {
    if (parsed.data.engine === "brave") {
      return Response.json({ results: await searchBrave(parsed.data.query, parsed.data.maxResults, process.env.BRAVE_API_KEY) });
    }
    if (parsed.data.engine === "tavily") {
      const key = process.env.TAVILY_API_KEY;
      if (!key) return Response.json({ error: "Thiếu TAVILY_API_KEY." }, { status: 400 });
      const response = await fetch("https://api.tavily.com/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ api_key: key, query: parsed.data.query, max_results: parsed.data.maxResults }) });
      if (!response.ok) throw new Error(`Tavily ${response.status}`);
      const json: unknown = await response.json();
      const rows = ((json as { results?: unknown[] }).results ?? []).flatMap((row) => {
        if (typeof row !== "object" || row === null) return [];
        const item = row as { title?: unknown; url?: unknown; content?: unknown };
        if (typeof item.title !== "string" || typeof item.url !== "string") return [];
        return [{ title: item.title, url: item.url, snippet: typeof item.content === "string" ? item.content : "", favicon: "", domain: new URL(item.url).hostname }];
      });
      return Response.json({ results: rows });
    }
    if (parsed.data.engine === "searxng") {
      const base = process.env.SEARXNG_URL;
      if (!base) return Response.json({ error: "Thiếu SEARXNG_URL." }, { status: 400 });
      const endpoint = `${base.replace(/\/$/, "")}/search?q=${encodeURIComponent(parsed.data.query)}&format=json&categories=general`;
      const response = await fetch(endpoint, { cache: "no-store" });
      if (!response.ok) throw new Error(`SearXNG ${response.status}`);
      const json: unknown = await response.json();
      const rows = ((json as { results?: unknown[] }).results ?? []).slice(0, parsed.data.maxResults).flatMap((row) => {
        if (typeof row !== "object" || row === null) return [];
        const item = row as { title?: unknown; url?: unknown; content?: unknown };
        if (typeof item.title !== "string" || typeof item.url !== "string") return [];
        return [{ title: item.title, url: item.url, snippet: typeof item.content === "string" ? item.content : "", favicon: "", domain: new URL(item.url).hostname }];
      });
      return Response.json({ results: rows });
    }
    return Response.json({ results: await searchDuckDuckGo(parsed.data.query, parsed.data.maxResults) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Search failed." }, { status: 502 });
  }
}
