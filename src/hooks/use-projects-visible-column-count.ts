"use client";

import { useMediaQuery } from "@/hooks/useMediaQuery";

export function useProjectsVisibleColumnCount(): number {
  const isMd = useMediaQuery("(min-width: 768px)");
  const isXl = useMediaQuery("(min-width: 1280px)");

  return 2 + (isMd ? 1 : 0) + (isXl ? 2 : 0);
}
