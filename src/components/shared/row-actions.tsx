"use client";

import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui";

interface RowActionsProps {
  canMutate: boolean;
  onOpen: () => void;
  children: React.ReactNode;
}

export function RowActions({ canMutate, onOpen, children }: RowActionsProps) {
  if (!canMutate) {
    return (
      <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-[20px] cursor-pointer"
          onClick={onOpen}
          aria-label="Open"
        >
          <ChevronRight className="size-6" />
        </Button>
      </div>
    );
  }
  return (
    <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  );
}
