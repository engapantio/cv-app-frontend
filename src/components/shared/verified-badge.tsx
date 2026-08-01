"use client";

import { cn } from "@/lib/utils";

const BADGE_PATH =
  "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z";

const CHECK_PATH = "m9 12 2 2 4-4";

const BADGE_MASK = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${BADGE_PATH}" fill="black"/></svg>`,
);

const CHECK_MASK = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${CHECK_PATH}" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
);

const MASK_IMAGE = `url("data:image/svg+xml,${BADGE_MASK}"), url("data:image/svg+xml,${CHECK_MASK}")`;

interface VerifiedBadgeProps {
  verified?: boolean;
  className?: string;
}

export function VerifiedBadge({ verified, className }: VerifiedBadgeProps) {
  if (!verified) return null;

  return (
    <span
      aria-label="Verified"
      title="Verified"
      className={cn("inline-block size-4 shrink-0 bg-black dark:bg-white", className)}
      style={{
        WebkitMaskImage: MASK_IMAGE,
        maskImage: MASK_IMAGE,
        WebkitMaskSize: "100% 100%",
        maskSize: "100% 100%",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
      }}
    />
  );
}
