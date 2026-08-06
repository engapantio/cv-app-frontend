"use client";

import { useTranslations } from "next-intl";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import type { PositionItem } from "@/features/positions/types";

interface OpenPositionOverlayProps {
  target: PositionItem | null;
  onClose: () => void;
}

export function OpenPositionOverlay({ target, onClose }: OpenPositionOverlayProps) {
  const t = useTranslations();

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton className="sm:max-w-md bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">
            {t("dialogs.openPosition")}
          </DialogTitle>
        </DialogHeader>
        {target && (
          <div className="space-y-6 py-4">
            <div className="group relative rounded-none border border-border transition-colors">
              <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-muted-foreground dark:text-[rgba(255,255,255,0.7)]">
                {t("fields.name")}
              </span>
              <div className="h-12 px-3 flex items-center text-base text-foreground">
                {target.name}
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-end pt-2">
          <Button
            variant="ghost"
            className="uppercase min-w-30 border border-border py-1.5"
            onClick={onClose}
          >
            {t("buttons.close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
