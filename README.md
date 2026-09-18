# AI Meow 🐱

AI Meow là trợ lý AI cá nhân theo hướng **local-first**, không cần database server. Conversation, messages, files và settings được lưu trong IndexedDB bằng Dexie.js. Provider AI được gọi qua Next.js Route Handlers chạy Node.js.

## Kiến trúc

- Next.js App Router + TypeScript strict
- React 19 + Tailwind CSS
- IndexedDB/Dexie.js: dữ liệu app trên trình duyệt
- AES-256-GCM: mã hóa API key trước khi ghi IndexedDB
- `/api/chat`: proxy streaming + OpenAI-compatible providers + fallback
- `/api/search`: DuckDuckGo, Brave, Tavily, SearXNG
- `/api/upload`: PNG/JPG/WebP/GIF/PDF/TXT/MD/DOCX/XLSX/CSV/JSON/PY/JS/TS
- Node.js runtime; không dùng Edge runtime

## Cài đặt local

```bash
npm install
cp .env.example .env.local
npm run type-check
npm run build
npm run dev
```

Mở `http://localhost:3000`.

## API key

AI Meow hỗ trợ key server-side qua `.env.local` và key user nhập qua Settings. Key user được AES-256-GCM mã hóa bằng passphrase trước khi lưu IndexedDB. Khi dùng key local, trình duyệt chỉ gửi key qua HTTPS tới `/api/chat`; key không được đóng gói vào JavaScript bundle và server không ghi key vào database.

Ví dụ:

```env
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
XKIRO_API_KEY=...
XKIRO_BASE_URL=https://your-xkiro-compatible-endpoint/v1
KIRA_API_KEY=...
KIRA_BASE_URL=https://your-kira-compatible-endpoint/v1
OPENAI_API_KEY=sk-...
```

## Provider mới

1. Thêm provider ID vào `lib/providers.ts`.
2. Thêm base URL/env key.
3. Cho provider trả OpenAI-compatible `/models` và `/chat/completions`.
4. Thêm lựa chọn trong `ProviderSelector.tsx`.

## Deploy Vercel

1. Push repository lên GitHub.
2. Import repository vào Vercel.
3. Framework: Next.js.
4. Build command: `npm run build`.
5. Thêm Environment Variables tương ứng với provider cần dùng.
6. Deploy.

API routes đã khai báo `runtime = "nodejs"`, `dynamic = "force-dynamic"` và `maxDuration = 60`.

## Dữ liệu

Dữ liệu hội thoại/file nằm trong browser IndexedDB. Hãy dùng Settings → Dữ liệu → Export tất cả để tạo backup JSON. API key không được đưa vào backup plaintext.

## Troubleshooting

### Build lỗi do package

```bash
rm -rf node_modules .next package-lock.json
npm install
npm run type-check
npm run build
```

### Provider trả 401

Kiểm tra API key, Base URL và model ID. OpenRouter thường yêu cầu URL `https://openrouter.ai/api/v1`.

### Search lỗi

DuckDuckGo không cần key. Brave/Tavily/SearXNG cần cấu hình ENV tương ứng.

### Mất API key local

Key local cần passphrase để giải mã sau reload. Nếu quên passphrase, key mã hóa cũ không thể khôi phục từ IndexedDB.

## Scripts

- `npm run dev` — development
- `npm run build` — production build
- `npm run start` — serve production
- `npm run type-check` — TypeScript strict check
