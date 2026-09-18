import Dexie, { type Table } from "dexie";

export type MessageRole = "user" | "assistant" | "system";

export interface Conversation {
  id?: number;
  title: string;
  createdAt: number;
  updatedAt: number;
  model: string;
  provider: string;
  systemPrompt: string;
  tags: string[];
  pinned: boolean;
  archived: boolean;
}

export interface ToolCallRecord {
  id: string;
  name: string;
  state: "pending" | "running" | "done" | "error";
  result?: string;
}

export interface SourceRecord {
  title: string;
  url: string;
  snippet: string;
  favicon?: string;
  domain: string;
}

export interface ChatMessage {
  id?: number;
  conversationId: number;
  role: MessageRole;
  content: string;
  reasoning?: string;
  toolCalls?: ToolCallRecord[];
  sources?: SourceRecord[];
  attachments?: string[];
  createdAt: number;
  tokens?: number;
  cost?: number;
}

export interface StoredFile {
  id?: number;
  name: string;
  type: string;
  size: number;
  content?: string;
  blob?: Blob;
  createdAt: number;
  conversationId?: number;
  tags: string[];
}

export interface AttachmentRecord {
  id?: number;
  messageId: number;
  name: string;
  type: string;
  size: number;
  blob: Blob;
  extractedText?: string;
}

export interface SettingRecord {
  key: string;
  value: unknown;
}

export interface DraftRecord {
  conversationId: number;
  text: string;
  attachments: string[];
  updatedAt: number;
}

class AICommonDB extends Dexie {
  conversations!: Table<Conversation, number>;
  messages!: Table<ChatMessage, number>;
  files!: Table<StoredFile, number>;
  attachments!: Table<AttachmentRecord, number>;
  settings!: Table<SettingRecord, string>;
  drafts!: Table<DraftRecord, number>;

  constructor() {
    super("ai-meow");
    this.version(1).stores({
      conversations: "++id, title, createdAt, updatedAt, *tags",
      messages: "++id, conversationId, role, createdAt",
      files: "++id, name, type, size, createdAt, *tags",
      attachments: "++id, messageId, name, type, size",
      settings: "key",
      drafts: "conversationId"
    });
  }
}

export const db = new AICommonDB();

export async function settingGet<T>(key: string, fallback: T): Promise<T> {
  const row = await db.settings.get(key);
  return row ? (row.value as T) : fallback;
}

export async function settingSet(key: string, value: unknown): Promise<void> {
  await db.settings.put({ key, value });
}

export async function createConversation(initial?: Partial<Conversation>): Promise<number> {
  const now = Date.now();
  return db.conversations.add({
    title: "Cuộc trò chuyện mới",
    createdAt: now,
    updatedAt: now,
    model: "openai/gpt-4o-mini",
    provider: "openrouter",
    systemPrompt: "",
    tags: [],
    pinned: false,
    archived: false,
    ...initial
  });
}

export async function ensureConversation(id?: number): Promise<number> {
  if (typeof id === "number") {
    const exists = await db.conversations.get(id);
    if (exists) return id;
  }
  return createConversation();
}

export async function deleteConversation(id: number): Promise<void> {
  await db.transaction("rw", db.conversations, db.messages, db.drafts, async () => {
    await db.messages.where("conversationId").equals(id).delete();
    await db.drafts.delete(id);
    await db.conversations.delete(id);
  });
}

function redactSecrets(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactSecrets);
  if (typeof value !== "object" || value === null) return value;
  const source = value as Record<string, unknown>;
  const output: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(source)) {
    const lower = key.toLowerCase();
    if (lower.includes("apikey") || lower.includes("api_key") || lower.includes("keyenc") || lower === "ciphertext" || lower === "iv" || lower === "salt") {
      output[key] = null;
    } else {
      output[key] = redactSecrets(item);
    }
  }
  return output;
}

export async function exportDatabase(): Promise<Record<string, unknown>> {
  const [conversations, messages, files, attachments, settings, drafts] = await Promise.all([
    db.conversations.toArray(),
    db.messages.toArray(),
    db.files.toArray(),
    db.attachments.toArray(),
    db.settings.toArray(),
    db.drafts.toArray()
  ]);
  const safeSettings = settings.map((row) => ({ key: row.key, value: redactSecrets(row.value) }));

  const serializableFiles = files.map((file) => ({ ...file, blob: undefined }));
  const serializableAttachments = attachments.map((file) => ({ ...file, blob: undefined }));

  return { version: 1, exportedAt: new Date().toISOString(), conversations, messages, files: serializableFiles, attachments: serializableAttachments, settings: safeSettings, drafts };
}

export async function importDatabase(payload: Record<string, unknown>): Promise<void> {
  const conversations = Array.isArray(payload.conversations) ? payload.conversations as Conversation[] : [];
  const messages = Array.isArray(payload.messages) ? payload.messages as ChatMessage[] : [];
  const files = Array.isArray(payload.files) ? payload.files as StoredFile[] : [];
  const attachments = Array.isArray(payload.attachments) ? payload.attachments as AttachmentRecord[] : [];
  const settings = Array.isArray(payload.settings) ? payload.settings as SettingRecord[] : [];
  const drafts = Array.isArray(payload.drafts) ? payload.drafts as DraftRecord[] : [];

  await db.transaction("rw", db.conversations, db.messages, db.files, db.attachments, db.settings, db.drafts, async () => {
    for (const item of conversations) {
      const copy = { ...item };
      delete copy.id;
      await db.conversations.add(copy);
    }
    for (const item of messages) {
      const copy = { ...item };
      delete copy.id;
      await db.messages.add(copy);
    }
    for (const item of files) {
      const copy = { ...item, blob: undefined };
      delete copy.id;
      await db.files.add(copy);
    }
    for (const item of attachments) {
      if (!item.blob) continue;
      const copy = { ...item };
      delete copy.id;
      await db.attachments.add(copy);
    }
    for (const item of settings) {
      if (item.value !== null) await db.settings.put(item);
    }
    for (const item of drafts) await db.drafts.put(item);
  });
}
