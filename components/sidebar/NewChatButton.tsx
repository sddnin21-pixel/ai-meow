"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function NewChatButton({ onClick }: { onClick: () => void }) {
  return <Button variant="primary" className="w-full justify-center" onClick={onClick}><Plus size={18} /> Cuộc trò chuyện mới</Button>;
}
