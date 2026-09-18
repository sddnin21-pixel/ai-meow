import * as cheerio from "cheerio";
import { getDomain } from "../utils";

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  favicon: string;
  domain: string;
}

export async function searchDuckDuckGo(query: string, maxResults = 5): Promise<WebSearchResult[]> {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: { "User-Agent": "AI-Meow/1.0" },
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`DuckDuckGo trả về ${response.status}.`);
  const html = await response.text();
  const $ = cheerio.load(html);
  const results: WebSearchResult[] = [];
  $(".result").each((_, element) => {
    if (results.length >= maxResults) return false;
    const anchor = $(element).find(".result__a").first();
    const href = anchor.attr("href");
    const title = anchor.text().trim();
    const snippet = $(element).find(".result__snippet").text().trim();
    if (!href || !title) return;
    const domain = getDomain(href);
    results.push({ title, url: href, snippet, domain, favicon: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32` });
  });
  return results;
}

export async function searchBrave(query: string, maxResults = 5, apiKey?: string): Promise<WebSearchResult[]> {
  if (!apiKey) throw new Error("Thiếu Brave Search API key.");
  const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${maxResults}`, {
    headers: { Accept: "application/json", "X-Subscription-Token": apiKey },
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`Brave Search trả về ${response.status}.`);
  const json: unknown = await response.json();
  const web = (json as { web?: { results?: unknown[] } }).web?.results ?? [];
  return web.flatMap((item) => {
    if (typeof item !== "object" || item === null) return [];
    const row = item as { title?: unknown; url?: unknown; description?: unknown };
    if (typeof row.title !== "string" || typeof row.url !== "string") return [];
    const domain = getDomain(row.url);
    return [{ title: row.title, url: row.url, snippet: typeof row.description === "string" ? row.description : "", domain, favicon: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32` }];
  }).slice(0, maxResults);
}
