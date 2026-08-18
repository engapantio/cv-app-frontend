"use client";

import { useCallback, useEffect, useRef } from "react";

const DEFAULT_THRESHOLD = 500;

/**
 * Detects a sustained touch press (~threshold ms). A short tap leaves the flag
 * unset so the normal click/tap navigation proceeds; a long-press sets the flag
 * so callers can suppress the synthetic click that follows release.
 */
export function useLongPress(
  onLongPress: () => void,
  { threshold = DEFAULT_THRESHOLD }: { threshold?: number } = {},
) {
  const timerRef = useRef<number | null>(null);
  const longPressRef = useRef(false);
  const onLongPressRef = useRef(onLongPress);

  useEffect(() => {
    onLongPressRef.current = onLongPress;
  }, [onLongPress]);

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onTouchStart = useCallback(() => {
    clearTimer();
    longPressRef.current = false;
    timerRef.current = window.setTimeout(() => {
      longPressRef.current = true;
      onLongPressRef.current();
    }, threshold);
  }, [clearTimer, threshold]);

  const onTouchEnd = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  const onTouchMove = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  const onTouchCancel = onTouchEnd;

  const consumeLongPress = useCallback(() => {
    const triggered = longPressRef.current;
    longPressRef.current = false;
    return triggered;
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  return { onTouchStart, onTouchEnd, onTouchMove, onTouchCancel, consumeLongPress };
}
