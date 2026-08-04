"use client";

import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui";
import { useTranslations } from "next-intl";

interface RowActionsProps {
  canMutate: boolean;
  onOpen: () => void;
  children: React.ReactNode;
}

export function RowActions({ canMutate, onOpen, children }: RowActionsProps) {
  const t = useTranslations("buttons");
  if (!canMutate) {
    return (
      <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-[20px] cursor-pointer"
          onClick={onOpen}
          aria-label={t("open")}
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
