"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(hover: hover) and (pointer: fine)";

function subscribe(onStoreChange: () => void) {
  if (typeof window.matchMedia !== "function") return () => {};
  const mediaQuery = window.matchMedia(QUERY);
  mediaQuery.addEventListener?.("change", onStoreChange);
  return () => mediaQuery.removeEventListener?.("change", onStoreChange);
}

function getSnapshot() {
  return typeof window.matchMedia === "function" && window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

/** Whether the current input device supports hover (mouse/trackpad) rather than touch-only. */
export function useIsHoverCapable() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
