import { z } from "zod";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import { normalizeExtractedText } from "@/lib/tools/file-reader";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const allowed = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "application/pdf", "text/plain", "text/markdown", "application/json", "text/csv", "application/typescript", "text/javascript", "application/javascript", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]);

async function parseFile(file: File): Promise<{ text: string; base64?: string }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  if (file.type.startsWith("image/")) return { text: "[Ảnh upload — gửi kèm base64 cho model vision.]", base64: buffer.toString("base64") };
  if (file.type === "application/pdf") {
    const parsed = await pdfParse(buffer);
    return { text: normalizeExtractedText(parsed.text) };
  }
  if (file.type.includes("wordprocessingml.document")) {
    const result = await mammoth.extractRawText({ buffer });
    return { text: normalizeExtractedText(result.value) };
  }
  if (file.type.includes("spreadsheetml.sheet") || file.name.toLowerCase().endsWith(".xlsx")) {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const text = workbook.SheetNames.map((sheetName: string) => `## ${sheetName}\n${XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName])}`).join("\n\n");
    return { text: normalizeExtractedText(text) };
  }
  return { text: normalizeExtractedText(buffer.toString("utf8")) };
}

export async function POST(request: Request) {
  const form = await request.formData();
  const files = form.getAll("files").filter((value): value is File => value instanceof File);
  if (files.length === 0 || files.length > 5) return Response.json({ error: "Cần 1-5 file." }, { status: 400 });

  const results: Array<{ filename: string; type: string; size: number; text: string; base64?: string }> = [];
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) return Response.json({ error: `${file.name} vượt giới hạn 10MB.` }, { status: 413 });
    if (!allowed.has(file.type) && !/\.(txt|md|json|csv|py|js|ts)$/i.test(file.name)) return Response.json({ error: `Không hỗ trợ định dạng ${file.name}.` }, { status: 415 });
    const parsed = await parseFile(file);
    const entry: { filename: string; type: string; size: number; text: string; base64?: string } = { filename: file.name, type: file.type || "application/octet-stream", size: file.size, text: parsed.text };
    if (parsed.base64) entry.base64 = parsed.base64;
    results.push(entry);
  }
  const parsedSingle = results.length === 1 ? results[0] : undefined;
  return Response.json(parsedSingle ? parsedSingle : { files: results });
}
