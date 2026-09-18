export function normalizeExtractedText(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\n{4,}/g, "\n\n").trim().slice(0, 150_000);
}
