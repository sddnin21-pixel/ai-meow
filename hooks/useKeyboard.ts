"use client";

import { useEffect } from "react";

export function useKeyboard(bindings: Record<string, () => void>, enabled = true): void {
  useEffect(() => {
    if (!enabled) return;
    const handler = (event: KeyboardEvent) => {
      const key = [event.metaKey ? "Meta" : "", event.ctrlKey ? "Ctrl" : "", event.altKey ? "Alt" : "", event.shiftKey ? "Shift" : "", event.key].filter(Boolean).join("+");
      const action = bindings[key];
      if (action) { event.preventDefault(); action(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [bindings, enabled]);
}
