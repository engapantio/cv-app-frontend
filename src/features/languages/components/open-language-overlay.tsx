"use client";

import { useTranslations } from "next-intl";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import type { LanguageItem } from "@/features/languages/types";

interface OpenLanguageOverlayProps {
  target: LanguageItem | null;
  onClose: () => void;
}

export function OpenLanguageOverlay({ target, onClose }: OpenLanguageOverlayProps) {
  const t = useTranslations();

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton className="sm:max-w-2xl bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-lg font-semibold">
            {t("dialogs.openLanguage")}
          </DialogTitle>
        </DialogHeader>
        {target && (
          <div className="space-y-6 py-4">
            <div className="group relative rounded-none border border-border transition-colors">
              <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-muted-foreground dark:text-icon">
                {t("fields.name")}
              </span>
              <div className="h-12 px-3 flex items-center text-base text-foreground">
                {target.name}
              </div>
            </div>
            <div className="group relative rounded-none border border-border transition-colors">
              <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-muted-foreground dark:text-icon">
                {t("fields.nativeName")}
              </span>
              <div className="h-12 px-3 flex items-center text-base text-foreground">
                {target.native_name ?? "—"}
              </div>
            </div>
            <div className="group relative rounded-none border border-border transition-colors">
              <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-muted-foreground dark:text-icon">
                {t("fields.iso2")}
              </span>
              <div className="h-12 px-3 flex items-center text-base text-foreground">
                {target.iso2}
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-end pt-2">
          <Button
            variant="ghost"
            className="uppercase min-w-45 border border-border py-1.5 text-border"
            onClick={onClose}
          >
            {t("buttons.close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
