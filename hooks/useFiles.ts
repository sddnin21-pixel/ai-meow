"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useCallback } from "react";
import { db, type StoredFile } from "@/lib/db";

export function useFiles() {
  const files = useLiveQuery(() => db.files.orderBy("createdAt").reverse().toArray(), [], []);
  const remove = useCallback(async (id: number) => db.files.delete(id), []);
  return { files: files as StoredFile[], remove };
}
