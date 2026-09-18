"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useEffect, useState } from "react";
import { createConversation, db, deleteConversation, type Conversation } from "@/lib/db";

export function useConversations(activeId?: number) {
  const conversations = useLiveQuery(() => db.conversations.orderBy("updatedAt").reverse().toArray(), [], []);
  const [resolvedId, setResolvedId] = useState<number | undefined>(activeId);

  useEffect(() => {
    if (activeId) setResolvedId(activeId);
    else if (conversations.length > 0) setResolvedId(conversations[0]?.id);
  }, [activeId, conversations]);

  const newChat = useCallback(async () => {
    const id = await createConversation();
    setResolvedId(id);
    return id;
  }, []);

  const remove = useCallback(async (id: number) => {
    await deleteConversation(id);
    if (resolvedId === id) setResolvedId(undefined);
  }, [resolvedId]);

  return { conversations: conversations as Conversation[], activeId: resolvedId, setActiveId: setResolvedId, newChat, remove };
}
