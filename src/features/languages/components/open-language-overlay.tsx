"use client";

import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import type { LanguageItem } from "@/features/languages/types";

interface OpenLanguageOverlayProps {
  target: LanguageItem | null;
  onClose: () => void;
}

export function OpenLanguageOverlay({ target, onClose }: OpenLanguageOverlayProps) {
  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton className="sm:max-w-md bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">Language</DialogTitle>
        </DialogHeader>
        {target && (
          <div className="space-y-6 py-4">
            <div className="group relative rounded-none border border-border transition-colors">
              <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-foreground">
                Name
              </span>
              <div className="h-12 py-1 px-3 flex items-center text-base text-foreground">
                {target.name}
              </div>
            </div>
            <div className="group relative rounded-none border border-border transition-colors">
              <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-foreground">
                Native Name
              </span>
              <div className="h-12 py-1 px-3 flex items-center text-base text-foreground">
                {target.native_name ?? "—"}
              </div>
            </div>
            <div className="group relative rounded-none border border-border transition-colors">
              <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-foreground">
                ISO2
              </span>
              <div className="h-12 py-1 px-3 flex items-center text-base text-foreground">
                {target.iso2}
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
            CLOSE
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
