"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { CanvasEditor } from "@/components/canvas/CanvasEditor";

function CanvasPageInner() {
  const params = useSearchParams();
  const raw = params.get("file");
  const fileId = raw ? Number(raw) : undefined;
  return <main className="min-h-screen bg-background"><header className="flex h-14 items-center gap-3 border-b border-border px-3"><Link href="/files" className="rounded-xl p-2 hover:bg-muted"><ArrowLeft size={18} /></Link><b>Canvas Editor</b></header><CanvasEditor fileId={Number.isFinite(fileId) ? fileId : undefined} /></main>;
}

export default function CanvasPage() { return <Suspense fallback={<div className="p-6">Đang mở Canvas...</div>}><CanvasPageInner /></Suspense>; }
