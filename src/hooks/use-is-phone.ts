"use client";

import { useSyncExternalStore } from "react";

const PHONE_BREAKPOINT = 768;

function subscribe(onStoreChange: () => void) {
  window.addEventListener("resize", onStoreChange);
  return () => window.removeEventListener("resize", onStoreChange);
}

function getSnapshot() {
  return window.innerWidth < PHONE_BREAKPOINT;
}

function getServerSnapshot() {
  return false;
}

/** Whether the viewport is a phone (< 768px). Labels on footer nav items are hidden below this. */
export function useIsPhone() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
