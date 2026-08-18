"use client";

import { X } from "lucide-react";

interface EnvPillProps {
  env: string;
  onRemove?: (env: string) => void;
}

export function EnvPill({ env, onRemove }: EnvPillProps) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-env-pill-bg text-env-pill-foreground">
      {env}
      {onRemove ? (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(env);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation();
              onRemove(env);
            }
          }}
          className="ml-0.5 rounded-full p-0.5 bg-env-pill-icon-bg text-env-pill-icon-foreground cursor-pointer hover:opacity-80 inline-flex items-center justify-center"
        >
          <X className="size-3" />
        </span>
      ) : (
        <span
          aria-hidden="true"
          className="ml-0.5 rounded-full p-0.5 bg-env-pill-icon-bg text-env-pill-icon-foreground opacity-50 inline-flex items-center justify-center"
        >
          <X className="size-3" />
        </span>
      )}
    </span>
  );
}
